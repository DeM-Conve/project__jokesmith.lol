package app.jokesmith.progress;

import app.jokesmith.core.ComedySkill;
import java.time.LocalDate;
import java.util.List;

/** Response bodies of /api/progress/**. */
public final class ProgressDtos {
  private ProgressDtos() {}

  public record StreakDto(int current, int best, boolean activeToday) {}

  public record RankDto(int index, String title, long minXp, String nextTitle, Long nextMinXp, int ranks) {}

  /** One checklist item of today's plan. kind: RIFF, DRILL or LESSON. */
  public record PlanItem(String kind, ComedySkill skill, String title, String why, String route, boolean done) {}

  public record TodayDto(
      boolean newUser,
      StreakDto streak,
      int todayXp,
      int dailyGoal,
      int todayReps,
      long totalXp,
      RankDto rank,
      List<PlanItem> plan) {}

  public record RankStep(String title, long minXp) {}

  public record SkillDto(ComedySkill skill, long xp, int reps, int level) {}

  public record DayDto(LocalDate date, int xp, int reps) {}

  public record RadarDto(
      List<SkillDto> skills,
      long totalXp,
      int totalReps,
      long jokesWritten,
      RankDto rank,
      /** Every rank, lowest first, for the career ladder. */
      List<RankStep> ladder,
      StreakDto streak,
      /** Oldest first, ending today; covers whole weeks (Mon-start) for the heatmap. */
      List<DayDto> days) {}
}
