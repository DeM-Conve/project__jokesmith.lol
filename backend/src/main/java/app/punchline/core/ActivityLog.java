package app.punchline.core;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Every feature calls {@link #record} when the user finishes a rep. Streaks, XP and
 * the skill radar (progress feature) are derived from these rows only.
 */
@Service
public class ActivityLog {
  private final PracticeEventRepository events;

  public ActivityLog(PracticeEventRepository events) {
    this.events = events;
  }

  /** @param xp 0..100, roughly: 10 = a quick rep, 25 = a full exercise, 50 = a lesson. */
  @Transactional
  public void record(UUID userId, ComedySkill skill, int xp) {
    events.save(new PracticeEvent(userId, skill, xp));
  }
}
