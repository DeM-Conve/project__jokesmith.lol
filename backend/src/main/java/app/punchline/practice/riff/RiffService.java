package app.punchline.practice.riff;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.core.Joke;
import app.punchline.core.JokeBank;
import app.punchline.core.JokeRepository;
import app.punchline.core.JokeSource;
import app.punchline.practice.riff.RiffDtos.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * The daily riff: one shared setup per day, timed volume writing, a best pick, and a
 * feed of everyone else's picks. Punchlines land in the shared joke bank as
 * DAILY_RIFF jokes with prompt_ref = the ISO date (the Arena pairs them from there).
 */
@Service
public class RiffService {
  /** A riff of this many punchlines counts as pushing past the obvious. */
  static final int GOAL = 10;
  static final int MAX_XP = 50;
  private static final int PEER_LIMIT = 50;

  private final RiffDayPins days;
  private final RiffSessionRepository sessions;
  private final RiffBestPickRepository picks;
  private final JokeBank bank;
  private final JokeRepository jokes;
  private final ActivityLog activity;

  public RiffService(RiffDayPins days, RiffSessionRepository sessions, RiffBestPickRepository picks,
      JokeBank bank, JokeRepository jokes, ActivityLog activity) {
    this.days = days;
    this.sessions = sessions;
    this.picks = picks;
    this.bank = bank;
    this.jokes = jokes;
    this.activity = activity;
  }

  /** xp scales with volume: 5 per punchline, capped at 50 (10 punchlines). */
  static int xpFor(int count) {
    return Math.min(MAX_XP, 5 * count);
  }

  /** Reaching the goal trains heightening (pushing past the obvious); shorter riffs train quick wit. */
  static ComedySkill skillFor(int count) {
    return count >= GOAL ? ComedySkill.HEIGHTENING : ComedySkill.REAL_TIME_WIT;
  }

  /** Server "today", with a day of slack so a user ahead of UTC can still play their today. */
  static void checkPlayable(LocalDate date) {
    if (date.isBefore(RiffPromptCatalog.LAUNCH) || date.isAfter(LocalDate.now().plusDays(1))) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No riff for " + date);
    }
  }

  @Transactional(readOnly = true)
  public RiffDayDto day(UUID userId, LocalDate date) {
    checkPlayable(date);
    RiffPrompt prompt = days.promptFor(date);
    int count = sessions.findByUserIdAndPromptDate(userId, date).size();
    List<PunchlineDto> mine = myPunchlines(userId, date);
    Long best = picks.findByUserIdAndPromptDate(userId, date).map(RiffBestPick::getJokeId).orElse(null);
    return new RiffDayDto(date, RiffPromptCatalog.dayNumber(date), prompt.setup(), count, mine, best,
        count > 0 ? prompt.modelPunchlines() : null);
  }

  @Transactional
  public RiffResultDto submit(UUID userId, LocalDate date, SubmitRiffRequest req) {
    checkPlayable(date);
    String setup = days.promptFor(date).setup();
    List<String> clean = req.punchlines().stream().map(String::strip).filter(s -> !s.isEmpty()).toList();
    if (clean.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Write at least one punchline");
    for (String p : clean) bank.save(userId, setup, p, JokeSource.DAILY_RIFF, date.toString());
    int xp = xpFor(clean.size());
    ComedySkill skill = skillFor(clean.size());
    sessions.save(new RiffSession(userId, date, clean.size(), req.secondsUsed(), xp));
    activity.record(userId, skill, xp);
    return new RiffResultDto(day(userId, date), clean.size(), xp, skill);
  }

  @Transactional
  public RiffDayDto pick(UUID userId, LocalDate date, long jokeId) {
    checkPlayable(date);
    Joke joke = jokes.findById(jokeId)
        .filter(j -> j.getUserId().equals(userId) && j.getSource() == JokeSource.DAILY_RIFF
            && date.toString().equals(j.getPromptRef()))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick one of your own punchlines for this day"));
    picks.findByUserIdAndPromptDate(userId, date).ifPresentOrElse(
        p -> p.repick(joke.getId()),
        () -> picks.save(new RiffBestPick(userId, date, joke.getId())));
    return day(userId, date);
  }

  @Transactional(readOnly = true)
  public List<PeerPickDto> peerPicks(UUID userId, LocalDate date) {
    checkPlayable(date);
    return picks.picksFor(date, PEER_LIMIT).stream()
        .map(r -> new PeerPickDto(r.getHandle(), r.getPunchline(), userId.equals(r.getUserId())))
        .toList();
  }

  /** Past days, newest first: the archive you can riff on retroactively. */
  @Transactional(readOnly = true)
  public List<ArchiveDayDto> archive(UUID userId, LocalDate today, int limit) {
    checkPlayable(today);
    LocalDate from = today.minusDays(Math.max(1, Math.min(limit, 365)));
    if (from.isBefore(RiffPromptCatalog.LAUNCH)) from = RiffPromptCatalog.LAUNCH;
    Set<LocalDate> riffed = new HashSet<>();
    sessions.findByUserIdAndPromptDateBetween(userId, from, today).forEach(s -> riffed.add(s.getPromptDate()));
    List<ArchiveDayDto> out = new ArrayList<>();
    for (LocalDate d = today.minusDays(1); !d.isBefore(from); d = d.minusDays(1)) {
      out.add(new ArchiveDayDto(d, RiffPromptCatalog.dayNumber(d), days.promptFor(d).setup(), riffed.contains(d)));
    }
    return out;
  }

  private List<PunchlineDto> myPunchlines(UUID userId, LocalDate date) {
    return jokes.findBySourceAndPromptRef(JokeSource.DAILY_RIFF, date.toString()).stream()
        .filter(j -> j.getUserId().equals(userId))
        .sorted(Comparator.comparing(Joke::getId))
        .map(j -> new PunchlineDto(j.getId(), j.getPunchline()))
        .toList();
  }
}
