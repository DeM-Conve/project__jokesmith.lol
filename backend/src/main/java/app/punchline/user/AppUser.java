package app.punchline.user;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "app_user")
public class AppUser {
  @Id
  private UUID id;

  @Column(nullable = false, length = 32)
  private String handle;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected AppUser() {}

  public AppUser(UUID id, String handle) {
    this.id = id;
    this.handle = handle;
  }

  public UUID getId() { return id; }
  public String getHandle() { return handle; }
  public void setHandle(String handle) { this.handle = handle; }
  public Instant getCreatedAt() { return createdAt; }
}
