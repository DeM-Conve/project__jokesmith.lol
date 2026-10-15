package app.punchline.progress;

import app.punchline.core.ComedySkill;
import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/** Slim reads of practice_event (skill, xp, timestamp) and lesson completions without loading entities. */
@Component
class ProgressEventQueries {
  record Row(ComedySkill skill, int xp, Instant at) {}

  private final JdbcTemplate jdbc;

  ProgressEventQueries(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  /**
   * Lessons the user has completed (learn feature's table, read-only): skill -> last
   * completion time. The curriculum's source of truth, so a 50-xp riff isn't mistaken for a lesson.
   */
  Map<ComedySkill, Instant> lessonCompletions(UUID userId) {
    Map<ComedySkill, Instant> done = new EnumMap<>(ComedySkill.class);
    jdbc.query("SELECT skill::text, last_completed_at FROM learn_lesson_completion WHERE user_id = ?",
        rs -> {
          done.put(ComedySkill.valueOf(rs.getString(1)), rs.getTimestamp(2).toInstant());
        },
        userId);
    return done;
  }

  List<Row> all(UUID userId) {
    return jdbc.query(
        "SELECT skill::text, xp, created_at FROM practice_event WHERE user_id = ? ORDER BY created_at",
        (rs, i) -> new Row(ComedySkill.valueOf(rs.getString(1)), rs.getInt(2), rs.getTimestamp(3).toInstant()),
        userId);
  }
}
