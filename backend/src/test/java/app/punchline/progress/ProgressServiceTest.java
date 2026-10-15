package app.punchline.progress;

import static org.assertj.core.api.Assertions.assertThat;

import app.punchline.PostgresTestBase;
import app.punchline.core.ComedySkill;
import app.punchline.progress.ProgressDtos.*;
import app.punchline.user.UserService;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class ProgressServiceTest extends PostgresTestBase {
  static final ZoneId UTC = ZoneOffset.UTC;
  static final ZoneId KOLKATA = ZoneId.of("Asia/Kolkata"); // +05:30
  static final ZoneId LA = ZoneId.of("America/Los_Angeles"); // -07:00 in October
  /** "Now" for every test: Thursday 2026-10-15 12:00 UTC. */
  static final Instant NOW = Instant.parse("2026-10-15T12:00:00Z");

  @Autowired ProgressService service;
  @Autowired UserService users;
  @Autowired JdbcTemplate jdbc;

  UUID user;

  @BeforeEach
  void newUser() {
    user = UUID.randomUUID();
    users.getOrCreate(user);
  }

  void event(ComedySkill skill, int xp, String at) {
    jdbc.update("INSERT INTO practice_event (user_id, skill, xp, created_at) VALUES (?, ?::comedy_skill, ?, ?)",
        user, skill.name(), xp, Timestamp.from(Instant.parse(at)));
  }

  void joke(String source, String at) {
    jdbc.update("INSERT INTO joke (user_id, setup, punchline, source, created_at) VALUES (?, 's', 'p', ?::joke_source, ?)",
        user, source, Timestamp.from(Instant.parse(at)));
  }

  void lesson(ComedySkill skill, String at) {
    jdbc.update("""
        INSERT INTO learn_lesson_completion (user_id, skill, best_quiz_correct, quiz_total, first_completed_at, last_completed_at)
        VALUES (?, ?::comedy_skill, 3, 3, ?, ?)""", user, skill.name(), Timestamp.from(Instant.parse(at)), Timestamp.from(Instant.parse(at)));
  }

  // ---- streaks -------------------------------------------------------------------

  @Test
  void brandNewUserHasNothingAndIsNew() {
    TodayDto t = service.today(user, UTC, NOW);
    assertThat(t.newUser()).isTrue();
    assertThat(t.streak()).isEqualTo(new StreakDto(0, 0, false));
    assertThat(t.todayXp()).isZero();
    assertThat(t.dailyGoal()).isEqualTo(ProgressService.DAILY_GOAL);
    assertThat(t.rank().title()).isEqualTo("Open-Mic Newbie");
  }

  @Test
  void streakAliveFromYesterdayButNotActiveToday() {
    event(ComedySkill.ANATOMY, 10, "2026-10-14T09:00:00Z");
    event(ComedySkill.ANATOMY, 10, "2026-10-13T09:00:00Z");
    TodayDto t = service.today(user, UTC, NOW);
    assertThat(t.streak()).isEqualTo(new StreakDto(2, 2, false));
    assertThat(t.newUser()).isFalse();
  }

  @Test
  void repTodayExtendsStreak() {
    event(ComedySkill.ANATOMY, 10, "2026-10-14T09:00:00Z");
    event(ComedySkill.FORMULAS, 25, "2026-10-15T08:00:00Z");
    event(ComedySkill.FORMULAS, 25, "2026-10-15T09:00:00Z");
    TodayDto t = service.today(user, UTC, NOW);
    assertThat(t.streak()).isEqualTo(new StreakDto(2, 2, true));
    assertThat(t.todayXp()).isEqualTo(50);
    assertThat(t.todayReps()).isEqualTo(2);
    assertThat(t.totalXp()).isEqualTo(60);
  }

  @Test
  void gapBreaksCurrentStreakButKeepsBest() {
    for (int d = 3; d <= 7; d++) event(ComedySkill.ECONOMY, 10, "2026-10-%02dT10:00:00Z".formatted(d));
    event(ComedySkill.ECONOMY, 10, "2026-10-13T10:00:00Z"); // two days ago: dead
    TodayDto t = service.today(user, UTC, NOW);
    assertThat(t.streak().current()).isZero();
    assertThat(t.streak().best()).isEqualTo(5);
  }

  @Test
  void daysAreCountedInTheUsersTimezone() {
    // 20:00 UTC on the 14th is 01:30 on the 15th in Kolkata, and 13:00 on the 14th in LA.
    event(ComedySkill.ANATOMY, 10, "2026-10-14T20:00:00Z");
    // 03:00 UTC on the 14th is 08:30 on the 14th in Kolkata, 20:00 on the 13th in LA.
    event(ComedySkill.ANATOMY, 10, "2026-10-14T03:00:00Z");

    TodayDto kolkata = service.today(user, KOLKATA, NOW); // now = 17:30 on the 15th
    assertThat(kolkata.streak()).isEqualTo(new StreakDto(2, 2, true));
    assertThat(kolkata.todayXp()).isEqualTo(10);

    TodayDto utc = service.today(user, UTC, NOW);
    assertThat(utc.streak()).isEqualTo(new StreakDto(1, 1, false)); // both on the 14th

    TodayDto la = service.today(user, LA, NOW); // now = 05:00 on the 15th
    assertThat(la.streak()).isEqualTo(new StreakDto(2, 2, false)); // 13th + 14th, alive via yesterday
  }

  @Test
  void midnightBoundaryInTimezone() {
    // 18:29 UTC = 23:59 Kolkata on the 14th; 18:31 UTC = 00:01 Kolkata on the 15th
    event(ComedySkill.ANATOMY, 10, "2026-10-14T18:29:00Z");
    TodayDto before = service.today(user, KOLKATA, Instant.parse("2026-10-14T18:30:00Z")); // 00:00 on the 15th
    assertThat(before.streak()).isEqualTo(new StreakDto(1, 1, false));
    assertThat(before.todayXp()).isZero();
    event(ComedySkill.ANATOMY, 10, "2026-10-14T18:31:00Z");
    TodayDto after = service.today(user, KOLKATA, Instant.parse("2026-10-14T18:32:00Z"));
    assertThat(after.streak()).isEqualTo(new StreakDto(2, 2, true));
  }

  @Test
  void badTimezoneFallsBackToUtc() {
    assertThat(ProgressService.zone("Not/AZone")).isEqualTo(UTC);
    assertThat(ProgressService.zone(null)).isEqualTo(UTC);
    assertThat(ProgressService.zone(" Asia/Kolkata ")).isEqualTo(KOLKATA);
  }

  // ---- plan ----------------------------------------------------------------------

  @Test
  void newUserPlanIsRiffOneDrillAndLessonOne() {
    TodayDto t = service.today(user, UTC, NOW);
    assertThat(t.plan()).extracting(PlanItem::kind).containsExactly("RIFF", "DRILL", "LESSON");
    assertThat(t.plan().get(0).route()).isEqualTo("/riff");
    assertThat(t.plan().get(1).skill()).isEqualTo(ComedySkill.ANATOMY);
    assertThat(t.plan().get(1).route()).isEqualTo("/xray");
    assertThat(t.plan().get(2).route()).isEqualTo("/learn/ANATOMY");
    assertThat(t.plan()).noneMatch(PlanItem::done);
  }

  @Test
  void planTargetsTwoWeakestSkillsAndSkipsHeightening() {
    for (ComedySkill s : ComedySkill.values()) {
      if (s != ComedySkill.ECONOMY && s != ComedySkill.HEIGHTENING && s != ComedySkill.FEEDBACK) {
        event(s, 25, "2026-10-10T10:00:00Z");
      }
    }
    event(ComedySkill.FEEDBACK, 10, "2026-10-11T10:00:00Z");
    TodayDto t = service.today(user, UTC, NOW);
    assertThat(t.plan()).filteredOn(p -> p.kind().equals("DRILL")).extracting(PlanItem::skill)
        .containsExactly(ComedySkill.ECONOMY, ComedySkill.FEEDBACK);
    assertThat(t.plan()).filteredOn(p -> p.kind().equals("DRILL")).extracting(PlanItem::route)
        .containsExactly("/punchup", "/arena");
  }

  @Test
  void planIsStableWhileTickingItOff() {
    event(ComedySkill.FORMULAS, 25, "2026-10-12T10:00:00Z");
    TodayDto before = service.today(user, UTC, NOW);
    PlanItem firstDrill = before.plan().get(1);
    assertThat(firstDrill.done()).isFalse();
    // do that drill a lot today: it must stay in the plan, now ticked
    for (int i = 0; i < 10; i++) event(firstDrill.skill(), 25, "2026-10-15T1%d:00:00Z".formatted(i % 2));
    TodayDto after = service.today(user, UTC, NOW);
    assertThat(after.plan().get(1).skill()).isEqualTo(firstDrill.skill());
    assertThat(after.plan().get(1).done()).isTrue();
  }

  @Test
  void riffIsDoneWhenADailyRiffJokeWasBankedToday() {
    joke("DAILY_RIFF", "2026-10-14T10:00:00Z");
    assertThat(service.today(user, UTC, NOW).plan().get(0).done()).isFalse();
    joke("DAILY_RIFF", "2026-10-15T10:00:00Z");
    assertThat(service.today(user, UTC, NOW).plan().get(0).done()).isTrue();
  }

  @Test
  void nextLessonSkipsCompletedLessons() {
    lesson(ComedySkill.ANATOMY, "2026-10-10T10:00:00Z");
    lesson(ComedySkill.ASSOCIATION, "2026-10-11T10:00:00Z");
    event(ComedySkill.FORMULAS, 50, "2026-10-12T10:00:00Z"); // a big rep is not a lesson
    PlanItem lesson = service.today(user, UTC, NOW).plan().getLast();
    assertThat(lesson.skill()).isEqualTo(ComedySkill.FORMULAS);
    assertThat(lesson.route()).isEqualTo("/learn/FORMULAS");
    assertThat(lesson.done()).isFalse();

    lesson(ComedySkill.FORMULAS, "2026-10-15T10:00:00Z");
    PlanItem doneToday = service.today(user, UTC, NOW).plan().getLast();
    assertThat(doneToday.skill()).isEqualTo(ComedySkill.FORMULAS);
    assertThat(doneToday.done()).isTrue();
  }

  @Test
  void allLessonsDonePointsBackToCurriculum() {
    for (ComedySkill s : ComedySkill.values()) lesson(s, "2026-10-01T10:00:00Z");
    PlanItem lesson = service.today(user, UTC, NOW).plan().getLast();
    assertThat(lesson.route()).isEqualTo("/learn");
    assertThat(lesson.skill()).isNull();
  }

  // ---- radar ---------------------------------------------------------------------

  @Test
  void radarAggregatesSkillsDaysJokesAndRank() {
    for (int i = 0; i < 16; i++) event(ComedySkill.ANATOMY, 25, "2026-10-15T08:%02d:00Z".formatted(i));
    event(ComedySkill.DELIVERY, 25, "2026-10-14T08:00:00Z");
    joke("NOTEBOOK", "2026-10-14T08:00:00Z");
    joke("DAILY_RIFF", "2026-10-15T08:00:00Z");

    RadarDto r = service.radar(user, UTC, NOW);
    assertThat(r.skills()).hasSize(9);
    SkillDto anatomy = r.skills().get(0);
    assertThat(anatomy.skill()).isEqualTo(ComedySkill.ANATOMY);
    assertThat(anatomy.xp()).isEqualTo(400);
    assertThat(anatomy.reps()).isEqualTo(16);
    assertThat(anatomy.level()).isEqualTo(63);
    assertThat(r.totalXp()).isEqualTo(425);
    assertThat(r.totalReps()).isEqualTo(17);
    assertThat(r.jokesWritten()).isEqualTo(2);
    assertThat(r.rank().title()).isEqualTo("Five-Minute Spot");
    assertThat(r.rank().nextMinXp()).isEqualTo(600);
    assertThat(r.streak()).isEqualTo(new StreakDto(2, 2, true));

    // 19 full weeks + Mon..Thu of this week, starting on a Monday, ending today
    assertThat(r.days()).hasSize(19 * 7 + 4);
    assertThat(r.days().getFirst().date().getDayOfWeek()).isEqualTo(java.time.DayOfWeek.MONDAY);
    assertThat(r.days().getLast()).isEqualTo(new DayDto(LocalDate.of(2026, 10, 15), 400, 16));
    assertThat(r.days().get(r.days().size() - 2)).isEqualTo(new DayDto(LocalDate.of(2026, 10, 14), 25, 1));
  }

  @Test
  void radarOfOtherUserIsIsolated() {
    event(ComedySkill.ANATOMY, 25, "2026-10-15T08:00:00Z");
    UUID other = UUID.randomUUID();
    users.getOrCreate(other);
    RadarDto r = service.radar(other, UTC, NOW);
    assertThat(r.totalXp()).isZero();
    assertThat(r.skills()).allMatch(s -> s.level() == 0);
  }
}
