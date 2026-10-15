package app.punchline.learn;

import app.punchline.core.ComedySkill;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A user's completion of one curriculum lesson (table {@code learn_lesson_completion}). */
@Entity
@Table(name = "learn_lesson_completion")
public class LessonCompletion {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "comedy_skill")
  private ComedySkill skill;

  @Column(name = "best_quiz_correct", nullable = false)
  private short bestQuizCorrect;

  @Column(name = "quiz_total", nullable = false)
  private short quizTotal;

  @Column(name = "times_completed", nullable = false)
  private int timesCompleted = 1;

  @Column(name = "first_completed_at", nullable = false, updatable = false)
  private Instant firstCompletedAt = Instant.now();

  @Column(name = "last_completed_at", nullable = false)
  private Instant lastCompletedAt = Instant.now();

  protected LessonCompletion() {}

  public LessonCompletion(UUID userId, ComedySkill skill, int quizCorrect, int quizTotal) {
    this.userId = userId;
    this.skill = skill;
    this.bestQuizCorrect = (short) quizCorrect;
    this.quizTotal = (short) quizTotal;
  }

  /** Another run through the lesson: keep the best score (by ratio). */
  public void again(int quizCorrect, int total) {
    timesCompleted++;
    lastCompletedAt = Instant.now();
    if ((double) quizCorrect / total >= (double) bestQuizCorrect / quizTotal) {
      bestQuizCorrect = (short) quizCorrect;
      quizTotal = (short) total;
    }
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public ComedySkill getSkill() { return skill; }
  public int getBestQuizCorrect() { return bestQuizCorrect; }
  public int getQuizTotal() { return quizTotal; }
  public int getTimesCompleted() { return timesCompleted; }
  public Instant getFirstCompletedAt() { return firstCompletedAt; }
  public Instant getLastCompletedAt() { return lastCompletedAt; }
}
