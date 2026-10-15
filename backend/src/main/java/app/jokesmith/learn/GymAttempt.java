package app.jokesmith.learn;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** One Formula Gym rep (table {@code learn_gym_attempt}); the joke text is in the shared bank. */
@Entity
@Table(name = "learn_gym_attempt")
public class GymAttempt {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "joke_id")
  private Long jokeId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "learn_joke_formula")
  private JokeFormula formula;

  @Column(name = "premise_id", nullable = false, length = 32)
  private String premiseId;

  @Column(name = "checks_passed", nullable = false)
  private short checksPassed;

  @Column(name = "checks_total", nullable = false)
  private short checksTotal;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected GymAttempt() {}

  public GymAttempt(UUID userId, Long jokeId, JokeFormula formula, String premiseId, int passed, int total) {
    this.userId = userId;
    this.jokeId = jokeId;
    this.formula = formula;
    this.premiseId = premiseId;
    this.checksPassed = (short) passed;
    this.checksTotal = (short) total;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public Long getJokeId() { return jokeId; }
  public JokeFormula getFormula() { return formula; }
  public String getPremiseId() { return premiseId; }
  public int getChecksPassed() { return checksPassed; }
  public int getChecksTotal() { return checksTotal; }
  public Instant getCreatedAt() { return createdAt; }
}
