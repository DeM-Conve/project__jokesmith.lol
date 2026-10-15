package app.jokesmith.progress;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ProgressMathTest {
  static final LocalDate TODAY = LocalDate.of(2026, 10, 15);

  @Test
  void levelHasDiminishingReturns() {
    assertThat(ProgressMath.skillLevel(0)).isZero();
    assertThat(ProgressMath.skillLevel(-5)).isZero();
    assertThat(ProgressMath.skillLevel(25)).isEqualTo(6);
    assertThat(ProgressMath.skillLevel(400)).isEqualTo(63);
    assertThat(ProgressMath.skillLevel(1000)).isEqualTo(92);
    assertThat(ProgressMath.skillLevel(100_000)).isEqualTo(100);
    // the first 100 xp are worth more than the 100 xp after 1000
    int early = ProgressMath.skillLevel(100) - ProgressMath.skillLevel(0);
    int late = ProgressMath.skillLevel(1100) - ProgressMath.skillLevel(1000);
    assertThat(early).isGreaterThan(late * 5);
  }

  @Test
  void levelIsMonotonic() {
    int prev = 0;
    for (int xp = 0; xp < 5000; xp += 10) {
      int lvl = ProgressMath.skillLevel(xp);
      assertThat(lvl).isGreaterThanOrEqualTo(prev).isBetween(0, 100);
      prev = lvl;
    }
  }

  @Test
  void ranksClimbFromOpenMicToHeadliner() {
    assertThat(ProgressMath.RANKS).hasSizeGreaterThanOrEqualTo(8);
    assertThat(ProgressMath.rankFor(0).title()).isEqualTo("Open-Mic Newbie");
    assertThat(ProgressMath.rankFor(99).index()).isZero();
    assertThat(ProgressMath.rankFor(100).index()).isEqualTo(1);
    assertThat(ProgressMath.rankFor(1_000_000).title()).isEqualTo("Headliner");
    assertThat(ProgressMath.nextRank(ProgressMath.rankFor(1_000_000))).isNull();
    assertThat(ProgressMath.nextRank(ProgressMath.rankFor(0)).minXp()).isEqualTo(100);
  }

  @Test
  void streakCountsFromTodayOrYesterday() {
    assertThat(ProgressMath.currentStreak(Set.of(), TODAY)).isZero();
    assertThat(ProgressMath.currentStreak(Set.of(TODAY), TODAY)).isEqualTo(1);
    // nothing yet today, but yesterday keeps it alive
    assertThat(ProgressMath.currentStreak(Set.of(TODAY.minusDays(1), TODAY.minusDays(2)), TODAY)).isEqualTo(2);
    // a missed day breaks it
    assertThat(ProgressMath.currentStreak(Set.of(TODAY.minusDays(2), TODAY.minusDays(3)), TODAY)).isZero();
    // a gap further back caps the run
    assertThat(ProgressMath.currentStreak(Set.of(TODAY, TODAY.minusDays(1), TODAY.minusDays(3)), TODAY)).isEqualTo(2);
  }

  @Test
  void bestStreakFindsLongestRun() {
    Set<LocalDate> days = Set.of(TODAY, TODAY.minusDays(5), TODAY.minusDays(6), TODAY.minusDays(7), TODAY.minusDays(9));
    assertThat(ProgressMath.bestStreak(days)).isEqualTo(3);
    assertThat(ProgressMath.bestStreak(Set.of())).isZero();
    // across a month boundary
    assertThat(ProgressMath.bestStreak(Set.of(LocalDate.of(2026, 9, 30), LocalDate.of(2026, 10, 1)))).isEqualTo(2);
  }
}
