package app.punchline.workshop.punchup;

import static app.punchline.workshop.WorkshopJokes.*;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.core.Joke;
import app.punchline.core.JokeBank;
import app.punchline.core.JokeRepository;
import app.punchline.core.JokeSource;
import app.punchline.workshop.WorkshopJokes;
import app.punchline.workshop.arena.ArenaService;
import app.punchline.workshop.punchup.PunchUpAnalyser.Analysis;
import app.punchline.workshop.punchup.PunchUpAnalyser.Critique;
import app.punchline.workshop.punchup.PunchUpAnalyser.Move;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * The Socratic punch-up loop: diagnose (questions + flags), the user rewrites, critique with a
 * before/after diff, then optional rewrite moves the user applies. Every version is saved to
 * the joke bank (source PUNCH_UP); the first rewrite of a session earns ECONOMY xp.
 */
@Service
public class PunchUpService {
  static final int REWRITE_XP = 25;
  static final int MAX_VERSIONS = 12;

  public record Version(long jokeId, int number, String setup, String punchline, Instant createdAt,
      Analysis analysis) {}

  public record Session(long id, PunchUpStage stage, Long originJokeId, List<Version> versions, Critique critique,
      boolean movesUnlocked, boolean latestInArena) {}

  public record Moves(long jokeId, List<Move> moves) {}

  public record Summary(long id, Instant createdAt, int versions, String setup, String punchline, int firstScore,
      int latestScore) {}

  private final PunchUpSessionRepository sessions;
  private final PunchUpAnalyser analyser;
  private final JokeBank bank;
  private final JokeRepository jokes;
  private final WorkshopJokes owned;
  private final ActivityLog activity;
  private final ArenaService arena;

  public PunchUpService(PunchUpSessionRepository sessions, PunchUpAnalyser analyser, JokeBank bank,
      JokeRepository jokes, WorkshopJokes owned, ActivityLog activity, ArenaService arena) {
    this.sessions = sessions;
    this.analyser = analyser;
    this.bank = bank;
    this.jokes = jokes;
    this.owned = owned;
    this.activity = activity;
    this.arena = arena;
  }

  /** Stage 1: diagnose a new joke, or one already in the notebook ({@code fromJokeId}). */
  @Transactional
  public Session start(UUID userId, String setup, String punchline, Long fromJokeId) {
    if (fromJokeId != null) {
      Joke origin = owned.owned(userId, fromJokeId);
      return toDto(sessions.save(new PunchUpSession(userId, origin.getId())));
    }
    if (punchline == null || punchline.isBlank()) throw badRequest("Write a punchline first");
    PunchUpSession s = sessions.saveAndFlush(new PunchUpSession(userId, null));
    bank.save(userId, strip(setup), punchline.strip(), JokeSource.PUNCH_UP, s.promptRef());
    return toDto(s);
  }

  /** Stage 2: save the user's rewrite and critique it against the previous version. */
  @Transactional
  public Session rewrite(UUID userId, long id, String setup, String punchline) {
    PunchUpSession s = owned(userId, id);
    List<Joke> versions = versionJokes(s);
    if (versions.size() >= MAX_VERSIONS) throw conflict("That's " + MAX_VERSIONS + " drafts. Start a fresh session.");
    Joke prev = versions.get(versions.size() - 1);
    if (norm(prev.getSetup()).equals(norm(setup)) && norm(prev.getPunchline()).equals(norm(punchline))) {
      throw badRequest("That's the same as your last draft. Change one thing, even one word.");
    }
    bank.save(userId, strip(setup), punchline.strip(), JokeSource.PUNCH_UP, s.promptRef());
    boolean first = s.getRewrites() == 0;
    s.recordRewrite();
    if (first) activity.record(userId, ComedySkill.ECONOMY, REWRITE_XP);
    return toDto(s);
  }

  @Transactional(readOnly = true)
  public Session get(UUID userId, long id) {
    return toDto(owned(userId, id));
  }

  /** Concrete moves for the latest draft. Locked until the user has tried a rewrite themselves. */
  @Transactional(readOnly = true)
  public Moves moves(UUID userId, long id) {
    PunchUpSession s = owned(userId, id);
    if (s.getStage() != PunchUpStage.REWRITTEN) {
      throw conflict("Try a rewrite yourself first. Moves unlock after your first rewrite.");
    }
    List<Joke> vs = versionJokes(s);
    Joke latest = vs.get(vs.size() - 1);
    Analysis a = analyser.analyse(latest.getSetup(), latest.getPunchline());
    return new Moves(latest.getId(), analyser.moves(latest.getSetup(), latest.getPunchline(), a));
  }

  /** Puts the latest draft in the arena for real feedback. */
  @Transactional
  public Session sendToArena(UUID userId, long id) {
    PunchUpSession s = owned(userId, id);
    List<Joke> vs = versionJokes(s);
    arena.setInArena(vs.get(vs.size() - 1).getId(), true);
    return toDto(s);
  }

  @Transactional(readOnly = true)
  public List<Summary> recent(UUID userId) {
    List<Summary> out = new ArrayList<>();
    for (PunchUpSession s : sessions.findTop10ByUserIdOrderByCreatedAtDesc(userId)) {
      List<Joke> vs = versionJokes(s);
      if (vs.isEmpty()) continue;
      Joke first = vs.get(0), last = vs.get(vs.size() - 1);
      out.add(new Summary(s.getId(), s.getCreatedAt(), vs.size(), last.getSetup(), last.getPunchline(),
          analyser.analyse(first.getSetup(), first.getPunchline()).metrics().score(),
          analyser.analyse(last.getSetup(), last.getPunchline()).metrics().score()));
    }
    return out;
  }

  private PunchUpSession owned(UUID userId, long id) {
    return sessions.findById(id).filter(s -> s.getUserId().equals(userId))
        .orElseThrow(() -> notFound("Punch-up session " + id + " not found"));
  }

  private List<Joke> versionJokes(PunchUpSession s) {
    List<Joke> out = new ArrayList<>();
    if (s.getOriginJokeId() != null) jokes.findById(s.getOriginJokeId()).ifPresent(out::add);
    jokes.findBySourceAndPromptRef(JokeSource.PUNCH_UP, s.promptRef()).stream()
        .filter(j -> j.getUserId().equals(s.getUserId()))
        .sorted(Comparator.comparing(Joke::getId))
        .forEach(out::add);
    return out;
  }

  private Session toDto(PunchUpSession s) {
    List<Joke> js = versionJokes(s);
    List<Version> vs = new ArrayList<>();
    for (Joke j : js) {
      vs.add(new Version(j.getId(), vs.size() + 1, j.getSetup(), j.getPunchline(), j.getCreatedAt(),
          analyser.analyse(j.getSetup(), j.getPunchline())));
    }
    Critique critique = null;
    if (js.size() >= 2) {
      Joke b = js.get(js.size() - 2), a = js.get(js.size() - 1);
      critique = analyser.critique(b.getSetup(), b.getPunchline(), a.getSetup(), a.getPunchline());
    }
    boolean inArena = !js.isEmpty() && arena.inArena(js.get(js.size() - 1).getId());
    return new Session(s.getId(), s.getStage(), s.getOriginJokeId(), vs, critique,
        s.getStage() == PunchUpStage.REWRITTEN, inArena);
  }

  private static String strip(String s) {
    return s == null ? "" : s.strip();
  }

  private static String norm(String s) {
    return strip(s).replaceAll("\\s+", " ").toLowerCase(java.util.Locale.ROOT);
  }
}
