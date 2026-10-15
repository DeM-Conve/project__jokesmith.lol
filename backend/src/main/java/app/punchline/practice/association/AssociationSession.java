package app.punchline.practice.association;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/** One association map (table {@code association_session}). */
@Entity
@Table(name = "association_session")
public class AssociationSession {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(nullable = false, length = 80)
  private String topic;

  /** Set when the first joke is written from a collision (the rep that earns xp). */
  @Column(name = "completed_at")
  private Instant completedAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected AssociationSession() {}

  public AssociationSession(UUID userId, String topic) {
    this.userId = userId;
    this.topic = topic;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public String getTopic() { return topic; }
  public Instant getCompletedAt() { return completedAt; }
  public Instant getCreatedAt() { return createdAt; }

  public boolean complete() {
    if (completedAt != null) return false;
    completedAt = Instant.now();
    return true;
  }
}
