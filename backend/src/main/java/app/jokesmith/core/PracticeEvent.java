package app.jokesmith.core;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** One completed rep (table {@code practice_event}). */
@Entity
@Table(name = "practice_event")
public class PracticeEvent {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "comedy_skill")
  private ComedySkill skill;

  @Column(nullable = false)
  private short xp;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected PracticeEvent() {}

  public PracticeEvent(UUID userId, ComedySkill skill, int xp) {
    this.userId = userId;
    this.skill = skill;
    this.xp = (short) Math.max(0, Math.min(100, xp));
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public ComedySkill getSkill() { return skill; }
  public int getXp() { return xp; }
  public Instant getCreatedAt() { return createdAt; }
}
