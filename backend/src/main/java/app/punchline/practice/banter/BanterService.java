package app.punchline.practice.banter;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.core.JokeBank;
import app.punchline.core.JokeSource;
import app.punchline.practice.banter.BanterDtos.*;
import app.punchline.practice.banter.BanterLineCatalog.Example;
import app.punchline.practice.banter.BanterLineCatalog.Line;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Banter simulator: five curated lines from one persona, a short countdown per reply,
 * a rule-based score with one coaching tip, then technique-tagged example replies and
 * a self-rating ("did yours beat it?"). Good replies go to the joke bank.
 */
@Service
public class BanterService {
  static final int ROUNDS = 5;
  static final List<Integer> TIMERS = List.of(15, 10, 5);
  /** A reply scoring at least this (of 15) in time is saved to the joke bank automatically. */
  static final int SAVE_THRESHOLD = 11;
  static final int MAX_XP = 50;

  private final BanterLineCatalog catalog;
  private final BanterSessionRepository sessions;
  private final BanterRoundRepository rounds;
  private final JokeBank bank;
  private final ActivityLog activity;

  public BanterService(BanterLineCatalog catalog, BanterSessionRepository sessions, BanterRoundRepository rounds,
      JokeBank bank, ActivityLog activity) {
    this.catalog = catalog;
    this.sessions = sessions;
    this.rounds = rounds;
    this.bank = bank;
    this.activity = activity;
  }

  public SetupDto setup() {
    return new SetupDto(
        Arrays.stream(BanterPersona.values())
            .map(p -> new PersonaDto(p, p.label, p.description, catalog.forPersona(p).size())).toList(),
        Arrays.stream(BanterTechnique.values()).map(t -> new TechniqueDto(t, t.label, t.description)).toList(),
        TIMERS, ROUNDS);
  }

  /** 10 for turning up, 6 per reply in time, 10 bonus if any reply hit the save bar; max 50. */
  static int xpFor(List<BanterRound> rs) {
    int inTime = (int) rs.stream().filter(r -> Boolean.FALSE.equals(r.getTimedOut())).count();
    boolean strong = rs.stream().anyMatch(BanterService::good);
    return Math.min(MAX_XP, 10 + 6 * inTime + (strong ? 10 : 0));
  }

  @Transactional
  public SessionDto start(UUID userId, StartRequest req) {
    if (!TIMERS.contains(req.secondsLimit())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Timer must be one of " + TIMERS);
    }
    BanterSession session = sessions.save(new BanterSession(userId, req.persona(), req.secondsLimit()));
    List<Line> picked = pickLines(userId, req.persona(), session.getId());
    for (int i = 0; i < picked.size(); i++) {
      rounds.save(new BanterRound(session.getId(), i + 1, picked.get(i).key(), picked.get(i).text()));
    }
    return dto(session);
  }

  @Transactional(readOnly = true)
  public SessionDto get(UUID userId, long id) {
    return dto(owned(userId, id));
  }

  @Transactional
  public SessionDto reply(UUID userId, long id, int roundNo, ReplyRequest req) {
    BanterSession session = owned(userId, id);
    BanterRound round = round(id, roundNo);
    if (round.isAnswered()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Round already answered");
    String reply = req.reply() == null ? "" : req.reply().strip();
    BanterScorer.Score score = BanterScorer.score(round.getLine(), reply, req.responseMs(), session.getSecondsLimit());
    Example example = chooseExample(round, score.spotted());
    round.answer(reply, req.responseMs(), score, example);
    if (good(round)) round.setJokeId(save(userId, round));

    List<BanterRound> all = rounds.findBySessionIdOrderByRoundNo(id);
    if (session.getCompletedAt() == null && all.stream().allMatch(BanterRound::isAnswered)) {
      int xp = xpFor(all);
      session.complete(xp);
      activity.record(userId, ComedySkill.REAL_TIME_WIT, xp);
    }
    return dto(session);
  }

  /** The user's verdict against the example; claiming a win saves the reply if it wasn't already. */
  @Transactional
  public SessionDto rate(UUID userId, long id, int roundNo, BanterSelfRating rating) {
    BanterSession session = owned(userId, id);
    BanterRound round = round(id, roundNo);
    if (!round.isAnswered()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Reply first, then rate it");
    round.setSelfRating(rating);
    boolean claimed = rating == BanterSelfRating.BEAT_IT || rating == BanterSelfRating.MATCHED;
    if (claimed && round.getJokeId() == null && round.getReply() != null && !round.getReply().isBlank()) {
      round.setJokeId(save(userId, round));
    }
    return dto(session);
  }

  private static boolean good(BanterRound r) {
    return r.isAnswered() && Boolean.FALSE.equals(r.getTimedOut()) && r.getReply() != null && !r.getReply().isBlank()
        && r.getWit() + r.getSurprise() + r.getKindness() >= SAVE_THRESHOLD;
  }

  private Long save(UUID userId, BanterRound r) {
    return bank.save(userId, r.getLine(), r.getReply(), JokeSource.BANTER, r.getLineKey()).getId();
  }

  /** Five lines, avoiding the persona's lines from the user's recent sessions when possible. */
  private List<Line> pickLines(UUID userId, BanterPersona persona, long excludeSession) {
    Set<String> recent = new HashSet<>();
    List<Long> recentIds = sessions.findTop6ByUserIdAndPersonaOrderByCreatedAtDesc(userId, persona).stream()
        .map(BanterSession::getId).filter(sid -> sid != excludeSession).toList();
    if (!recentIds.isEmpty()) rounds.findBySessionIdIn(recentIds).forEach(r -> recent.add(r.getLineKey()));
    List<Line> all = new ArrayList<>(catalog.forPersona(persona));
    Collections.shuffle(all, ThreadLocalRandom.current());
    all.sort(Comparator.comparingInt(l -> recent.contains(l.key()) ? 1 : 0));
    return all.subList(0, Math.min(ROUNDS, all.size()));
  }

  /** Show a technique the user didn't use, so every round teaches a new move. */
  private Example chooseExample(BanterRound round, BanterTechnique spotted) {
    List<Example> examples = catalog.get(round.getLineKey()).map(Line::examples).orElse(List.of());
    if (examples.isEmpty()) return null;
    List<Example> fresh = examples.stream().filter(e -> e.technique() != spotted).toList();
    List<Example> from = fresh.isEmpty() ? examples : fresh;
    return from.get(Math.floorMod(round.getId().intValue() * 31 + round.getRoundNo(), from.size()));
  }

  private SessionDto dto(BanterSession s) {
    List<RoundDto> out = new ArrayList<>();
    List<BanterRound> rs = rounds.findBySessionIdOrderByRoundNo(s.getId());
    for (BanterRound r : rs) out.add(new RoundDto(r.getRoundNo(), r.getLine(), r.isAnswered() ? result(r) : null));
    return new SessionDto(s.getId(), s.getPersona(), s.getSecondsLimit(), out, s.getCompletedAt() != null, s.getXp(),
        ComedySkill.REAL_TIME_WIT);
  }

  private ResultDto result(BanterRound r) {
    int total = r.getWit() + r.getSurprise() + r.getKindness();
    List<Example> examples = catalog.get(r.getLineKey()).map(Line::examples).orElse(List.of());
    ExampleDto main = r.getExample() == null ? null
        : new ExampleDto(r.getExampleTechnique(), r.getExampleTechnique().label, r.getExample());
    List<ExampleDto> more = examples.stream()
        .filter(e -> !e.text().equals(r.getExample()))
        .map(e -> new ExampleDto(e.technique(), e.technique().label, e.text())).toList();
    BanterTechnique spotted = BanterScorer.score(r.getLine(), r.getReply(), 0, 60).spotted();
    return new ResultDto(r.getReply(), Boolean.TRUE.equals(r.getTimedOut()), r.getWit(), r.getSurprise(), r.getKindness(),
        total, BanterScorer.verdict(total), r.getReply() == null || r.getReply().isBlank() ? null : spotted,
        r.getTip(), main, more, r.getSelfRating(), r.getJokeId() != null);
  }

  private BanterRound round(long sessionId, int roundNo) {
    return rounds.findBySessionIdAndRoundNo(sessionId, roundNo)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No round " + roundNo));
  }

  private BanterSession owned(UUID userId, long id) {
    return sessions.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such banter session"));
  }
}
