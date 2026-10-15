package app.jokesmith.practice.banter;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Five rounds of banter with one persona (table {@code banter_session}). */
@Entity
@Table(name = "banter_session")
public class BanterSession {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "banter_persona")
  private BanterPersona persona;

  @Column(name = "seconds_limit", nullable = false)
  private short secondsLimit;

  @Column
  private Short xp;

  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected BanterSession() {}

  public BanterSession(UUID userId, BanterPersona persona, int secondsLimit) {
    this.userId = userId;
    this.persona = persona;
    this.secondsLimit = (short) secondsLimit;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public BanterPersona getPersona() { return persona; }
  public int getSecondsLimit() { return secondsLimit; }
  public Integer getXp() { return xp == null ? null : (int) xp; }
  public Instant getCompletedAt() { return completedAt; }
  public Instant getCreatedAt() { return createdAt; }

  public void complete(int xp) {
    this.xp = (short) xp;
    this.completedAt = Instant.now();
  }
}
