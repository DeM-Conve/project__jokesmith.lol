package app.punchline.progress;

import app.punchline.core.ComedySkill;
import app.punchline.core.JokeSource;
import app.punchline.progress.ProgressDtos.*;
import app.punchline.progress.ProgressEventQueries.Row;
import java.time.DateTimeException;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Derives streaks, XP, the skill radar and today's plan from practice_event (and joke). */
@Service
public class ProgressService {
  /** A riff plus two drills at 25 xp each. */
  public static final int DAILY_GOAL = 75;
  /** Calendar heatmap length: this many whole weeks, ending with the current one. */
  public static final int HEATMAP_WEEKS = 20;

  private final ProgressEventQueries events;
  private final ProgressJokeRepository jokes;

  public ProgressService(ProgressEventQueries events, ProgressJokeRepository jokes) {
    this.events = events;
    this.jokes = jokes;
  }

  /** The user's zone from a browser IANA id; anything unparseable falls back to UTC. */
  public static ZoneId zone(String tz) {
    if (tz == null || tz.isBlank()) return ZoneOffset.UTC;
    try {
      return ZoneId.of(tz.strip());
    } catch (DateTimeException e) {
      return ZoneOffset.UTC;
    }
  }

  @Transactional(readOnly = true)
  public TodayDto today(UUID userId, ZoneId zone, Instant now) {
    List<Row> rows = events.all(userId);
    LocalDate today = LocalDate.ofInstant(now, zone);
    Instant startOfToday = today.atStartOfDay(zone).toInstant();

    Set<LocalDate> days = activeDays(rows, zone);
    List<Row> todays = rows.stream().filter(r -> !r.at().isBefore(startOfToday)).toList();
    int todayXp = todays.stream().mapToInt(Row::xp).sum();
    long totalXp = rows.stream().mapToLong(Row::xp).sum();
    boolean newUser = rows.isEmpty() && jokes.countByUserId(userId) == 0;

    return new TodayDto(newUser, streak(days, today), todayXp, DAILY_GOAL, todays.size(), totalXp,
        rank(totalXp), plan(userId, rows, startOfToday, newUser));
  }

  @Transactional(readOnly = true)
  public RadarDto radar(UUID userId, ZoneId zone, Instant now) {
    List<Row> rows = events.all(userId);
    LocalDate today = LocalDate.ofInstant(now, zone);

    Map<ComedySkill, long[]> perSkill = new EnumMap<>(ComedySkill.class); // [xp, reps]
    for (ComedySkill s : ComedySkill.values()) perSkill.put(s, new long[2]);
    for (Row r : rows) {
      long[] acc = perSkill.get(r.skill());
      acc[0] += r.xp();
      acc[1]++;
    }
    List<SkillDto> skills = perSkill.entrySet().stream()
        .map(e -> new SkillDto(e.getKey(), e.getValue()[0], (int) e.getValue()[1], ProgressMath.skillLevel(e.getValue()[0])))
        .toList();

    Map<LocalDate, int[]> perDay = new HashMap<>(); // [xp, reps]
    for (Row r : rows) {
      int[] acc = perDay.computeIfAbsent(LocalDate.ofInstant(r.at(), zone), d -> new int[2]);
      acc[0] += r.xp();
      acc[1]++;
    }
    LocalDate first = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).minusWeeks(HEATMAP_WEEKS - 1);
    List<DayDto> dayList = new ArrayList<>();
    for (LocalDate d = first; !d.isAfter(today); d = d.plusDays(1)) {
      int[] acc = perDay.getOrDefault(d, new int[2]);
      dayList.add(new DayDto(d, acc[0], acc[1]));
    }

    long totalXp = rows.stream().mapToLong(Row::xp).sum();
    return new RadarDto(skills, totalXp, rows.size(), jokes.countByUserId(userId), rank(totalXp),
        ProgressMath.RANKS.stream().map(r -> new RankStep(r.title(), r.minXp())).toList(),
        streak(perDay.keySet(), today), dayList);
  }

  static Set<LocalDate> activeDays(List<Row> rows, ZoneId zone) {
    return rows.stream().map(r -> LocalDate.ofInstant(r.at(), zone)).collect(Collectors.toSet());
  }

  static StreakDto streak(Set<LocalDate> days, LocalDate today) {
    return new StreakDto(ProgressMath.currentStreak(days, today), ProgressMath.bestStreak(days), days.contains(today));
  }

  static RankDto rank(long totalXp) {
    ProgressMath.Rank r = ProgressMath.rankFor(totalXp);
    ProgressMath.Rank next = ProgressMath.nextRank(r);
    return new RankDto(r.index(), r.title(), r.minXp(), next == null ? null : next.title(),
        next == null ? null : next.minXp(), ProgressMath.RANKS.size());
  }

  /**
   * Today's checklist: the Daily Riff, 1-2 drills for the weakest skills, the next
   * incomplete lesson (from the learn feature's completions). Weakness is judged on XP <em>before</em> today so the plan stays put while
   * the user ticks it off.
   */
  List<PlanItem> plan(UUID userId, List<Row> rows, Instant startOfToday, boolean newUser) {
    List<PlanItem> plan = new ArrayList<>();

    boolean riffDone = jokes.existsByUserIdAndSourceAndCreatedAtGreaterThanEqual(userId, JokeSource.DAILY_RIFF, startOfToday);
    plan.add(new PlanItem("RIFF", ComedySkill.HEIGHTENING, "Daily Riff",
        "Today's prompt, five minutes, as many angles as you can. Quantity first, quality later.", "/riff", riffDone));

    Map<ComedySkill, Long> xpBefore = new EnumMap<>(ComedySkill.class);
    Map<ComedySkill, Instant> lastBefore = new EnumMap<>(ComedySkill.class);
    Set<ComedySkill> trainedToday = EnumSet.noneOf(ComedySkill.class);
    for (ComedySkill s : ComedySkill.values()) xpBefore.put(s, 0L);
    for (Row r : rows) {
      if (!r.at().isBefore(startOfToday)) {
        trainedToday.add(r.skill());
      } else {
        xpBefore.merge(r.skill(), (long) r.xp(), Long::sum);
        lastBefore.put(r.skill(), r.at());
      }
    }
    Map<ComedySkill, Instant> lessons = events.lessonCompletions(userId);
    // A lesson finished today stays on the plan, ticked; otherwise the next one in curriculum order.
    ComedySkill lessonToday = Arrays.stream(ComedySkill.values())
        .filter(s -> lessons.containsKey(s) && !lessons.get(s).isBefore(startOfToday))
        .findFirst().orElse(null);

    // Weakest first; ties -> least recently practised (never first) -> curriculum order.
    Comparator<ComedySkill> weakest = Comparator.<ComedySkill>comparingLong(xpBefore::get)
        .thenComparing(s -> lastBefore.getOrDefault(s, Instant.EPOCH))
        .thenComparing(Enum::ordinal);
    int drillCount = newUser ? 1 : 2;
    Arrays.stream(ComedySkill.values())
        .filter(s -> s != ComedySkill.HEIGHTENING) // the riff already trains it
        .sorted(weakest)
        .limit(drillCount)
        .forEach(s -> {
          SkillDrills.Drill d = SkillDrills.DRILLS.get(s);
          plan.add(new PlanItem("DRILL", s, d.title(),
              SkillDrills.label(s) + " is your quietest skill. " + d.why(), d.route(), trainedToday.contains(s)));
        });

    if (lessonToday != null) {
      plan.add(new PlanItem("LESSON", lessonToday, "Lesson: " + SkillDrills.label(lessonToday),
          "Lesson done today. That's the theory banked.", "/learn/" + lessonToday.name(), true));
    } else {
      Arrays.stream(ComedySkill.values()).filter(s -> !lessons.containsKey(s)).findFirst().ifPresentOrElse(
          s -> plan.add(new PlanItem("LESSON", s, "Lesson: " + SkillDrills.label(s),
              "Next up in the curriculum. Ten minutes of theory you'll use in every rep.", "/learn/" + s.name(), false)),
          () -> plan.add(new PlanItem("LESSON", null, "Revisit the curriculum",
              "Every lesson is done. Re-reading one now will land differently than it did the first time.", "/learn", false)));
    }
    return plan;
  }
}
