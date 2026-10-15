package app.punchline.progress;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.core.Joke;
import app.punchline.core.JokeBank;
import app.punchline.core.JokeSource;
import app.punchline.progress.DeliveryDtos.*;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class DeliveryService {
  /** A full exercise (CLAUDE.md xp guide). */
  public static final int TAKE_XP = 25;

  private final DeliveryTakeRepository takes;
  private final ProgressJokeRepository jokes;
  private final JokeBank bank;
  private final ActivityLog activity;

  public DeliveryService(DeliveryTakeRepository takes, ProgressJokeRepository jokes, JokeBank bank, ActivityLog activity) {
    this.takes = takes;
    this.jokes = jokes;
    this.bank = bank;
    this.activity = activity;
  }

  @Transactional(readOnly = true)
  public List<BankJokeDto> bank(UUID userId) {
    return jokes.findTop60ByUserIdOrderByCreatedAtDesc(userId).stream()
        .map(j -> new BankJokeDto(j.getId(), j.getSetup(), j.getPunchline(), j.getSource().name(), j.getCreatedAt()))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<TakeDto> recent(UUID userId) {
    return takes.findTop20ByUserIdOrderByCreatedAtDesc(userId).stream().map(TakeDto::of).toList();
  }

  /**
   * Stores a take's metrics and records DELIVERY xp. A typed joke is banked (source
   * DELIVERY) the first time, so the Notebook and Arena can see it too.
   */
  @Transactional
  public TakeSaved save(UUID userId, TakeRequest req) {
    Joke joke;
    if (req.jokeId() != null) {
      joke = jokes.findByIdAndUserId(req.jokeId(), userId)
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such joke in your bank"));
    } else {
      String punch = req.punchline() == null ? "" : req.punchline().strip();
      if (punch.isEmpty()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick a joke from your bank or type one");
      }
      joke = bank.save(userId, req.setup() == null ? "" : req.setup().strip(), punch, JokeSource.DELIVERY, null);
    }
    String text = (joke.getSetup().isBlank() ? "" : joke.getSetup() + " ") + joke.getPunchline();
    DeliveryTake take = takes.save(new DeliveryTake(userId, joke.getId(), clip(text, 1000), clip(req.transcript(), 4000),
        req.durationMs(), req.speechMs(), req.wordCount(), (float) req.wordsPerMinute(), req.prePunchPauseMs(),
        req.longestPauseMs(), req.fillerCount(), req.punchLast(), (float) req.energyVariance(), req.score()));
    activity.record(userId, ComedySkill.DELIVERY, TAKE_XP);
    return new TakeSaved(TakeDto.of(take), TAKE_XP, takes.countByUserId(userId));
  }

  private static String clip(String s, int max) {
    if (s == null) return "";
    String t = s.strip();
    return t.length() <= max ? t : t.substring(0, max);
  }
}
