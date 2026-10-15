package app.punchline.workshop.punchup;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** One coaching session (table {@code workshop_punchup}). Versions are PUNCH_UP jokes. */
@Entity
@Table(name = "workshop_punchup")
public class PunchUpSession {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "origin_joke_id")
  private Long originJokeId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "workshop_punchup_stage")
  private PunchUpStage stage = PunchUpStage.DIAGNOSED;

  @Column(nullable = false)
  private short rewrites;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected PunchUpSession() {}

  public PunchUpSession(UUID userId, Long originJokeId) {
    this.userId = userId;
    this.originJokeId = originJokeId;
  }

  /** The prompt_ref shared by this session's PUNCH_UP versions. */
  public String promptRef() {
    return "punchup:" + id;
  }

  public void recordRewrite() {
    rewrites++;
    stage = PunchUpStage.REWRITTEN;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public Long getOriginJokeId() { return originJokeId; }
  public PunchUpStage getStage() { return stage; }
  public int getRewrites() { return rewrites; }
  public Instant getCreatedAt() { return createdAt; }
}
