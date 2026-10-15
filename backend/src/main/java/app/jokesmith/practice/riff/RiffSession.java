package app.jokesmith.practice.riff;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** One finished timed riff (table {@code riff_session}); punchlines are in {@code joke}. */
@Entity
@Table(name = "riff_session")
public class RiffSession {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "prompt_date", nullable = false)
  private LocalDate promptDate;

  @Column(name = "punchline_count", nullable = false)
  private short punchlineCount;

  @Column(name = "seconds_used", nullable = false)
  private short secondsUsed;

  @Column(nullable = false)
  private short xp;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected RiffSession() {}

  public RiffSession(UUID userId, LocalDate promptDate, int punchlineCount, int secondsUsed, int xp) {
    this.userId = userId;
    this.promptDate = promptDate;
    this.punchlineCount = (short) punchlineCount;
    this.secondsUsed = (short) secondsUsed;
    this.xp = (short) xp;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public LocalDate getPromptDate() { return promptDate; }
  public int getPunchlineCount() { return punchlineCount; }
  public int getSecondsUsed() { return secondsUsed; }
  public int getXp() { return xp; }
  public Instant getCreatedAt() { return createdAt; }
}
