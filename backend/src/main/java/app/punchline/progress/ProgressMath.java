package app.punchline.progress;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/** Pure maths behind the radar, ranks and streaks: no I/O, no clock. */
public final class ProgressMath {
  private ProgressMath() {}

  /** XP at which a skill reaches ~63% (1 - 1/e) of the way to 100. */
  static final double LEVEL_SCALE = 400.0;

  /**
   * Skill level 0..100 with diminishing returns: the first reps move the needle a lot,
   * mastery takes a long time. 100 xp -> 22, 400 -> 63, 1000 -> 92, 2000 -> 99.
   */
  public static int skillLevel(long xp) {
    if (xp <= 0) return 0;
    return (int) Math.min(100, Math.round(100 * (1 - Math.exp(-xp / LEVEL_SCALE))));
  }

  public record Rank(int index, String title, long minXp) {}

  /** Comedy career ladder by total XP, from first open mic to the top of the bill. */
  public static final List<Rank> RANKS = List.of(
      new Rank(0, "Open-Mic Newbie", 0),
      new Rank(1, "Bringer-Show Regular", 100),
      new Rank(2, "Five-Minute Spot", 300),
      new Rank(3, "Guest Spot", 600),
      new Rank(4, "Feature Act", 1000),
      new Rank(5, "Club Regular", 1600),
      new Rank(6, "Road Dog", 2500),
      new Rank(7, "Late-Night Writer", 4000),
      new Rank(8, "Headliner", 6000));

  public static Rank rankFor(long totalXp) {
    Rank r = RANKS.get(0);
    for (Rank candidate : RANKS) if (totalXp >= candidate.minXp()) r = candidate;
    return r;
  }

  /** The rank after {@code r}, or null at the top. */
  public static Rank nextRank(Rank r) {
    return r.index() + 1 < RANKS.size() ? RANKS.get(r.index() + 1) : null;
  }

  /**
   * Current streak: consecutive days with at least one rep ending today, or ending
   * yesterday if today has no rep yet (the streak is still alive until midnight).
   */
  public static int currentStreak(Set<LocalDate> activeDays, LocalDate today) {
    LocalDate day = activeDays.contains(today) ? today : today.minusDays(1);
    int n = 0;
    while (activeDays.contains(day)) {
      n++;
      day = day.minusDays(1);
    }
    return n;
  }

  /** Longest run of consecutive active days ever. */
  public static int bestStreak(Set<LocalDate> activeDays) {
    int best = 0;
    for (LocalDate d : activeDays) {
      if (activeDays.contains(d.minusDays(1))) continue; // not the start of a run
      int n = 0;
      LocalDate cur = d;
      while (activeDays.contains(cur)) {
        n++;
        cur = cur.plusDays(1);
      }
      best = Math.max(best, n);
    }
    return best;
  }
}
