package app.jokesmith.learn;

import app.jokesmith.core.ActivityLog;
import app.jokesmith.core.ComedySkill;
import app.jokesmith.core.JokeBank;
import app.jokesmith.core.JokeSource;
import app.jokesmith.learn.LearnDtos.*;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Curriculum progress: completing a lesson saves the "your turn" joke and, the first time, awards XP. */
@Service
public class LessonService {
  static final int XP = 50;

  private final LessonCompletionRepository completions;
  private final XRayRunRepository xrays;
  private final GymService gym;
  private final JokeBank bank;
  private final ActivityLog activity;
  private final JokeChecklist checklist;

  public LessonService(LessonCompletionRepository completions, XRayRunRepository xrays, GymService gym, JokeBank bank,
      ActivityLog activity, JokeChecklist checklist) {
    this.completions = completions;
    this.xrays = xrays;
    this.gym = gym;
    this.bank = bank;
    this.activity = activity;
    this.checklist = checklist;
  }

  public LearnProgress progress(UUID userId) {
    List<LessonStatus> lessons = completions.findByUserId(userId).stream().map(LessonStatus::of).toList();
    return new LearnProgress(lessons, lessons.size(), ComedySkill.values().length, xrays.countByUserId(userId),
        gym.totalReps(userId));
  }

  @Transactional
  public CompleteLessonResponse complete(UUID userId, ComedySkill skill, CompleteLessonRequest req) {
    Long jokeId = null;
    List<Check> checks = List.of();
    String punch = req.punchline() == null ? "" : req.punchline().strip();
    if (!punch.isEmpty()) {
      String setup = req.setup() == null ? "" : req.setup().strip();
      // The lesson's "your turn" exercise lands in the shared bank like every other joke.
      jokeId = bank.save(userId, setup, punch, JokeSource.NOTEBOOK, "lesson:" + skill.name()).getId();
      checks = checklist.check(req.formula(), null, setup, punch);
    }

    var existing = completions.findByUserIdAndSkill(userId, skill);
    boolean first = existing.isEmpty();
    LessonCompletion c;
    if (first) {
      c = completions.save(new LessonCompletion(userId, skill, req.quizCorrect(), req.quizTotal()));
      activity.record(userId, skill, XP);
    } else {
      c = existing.get();
      c.again(req.quizCorrect(), req.quizTotal());
    }
    return new CompleteLessonResponse(LessonStatus.of(c), first, first ? XP : 0, jokeId, checks);
  }
}
