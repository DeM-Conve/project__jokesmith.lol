package app.punchline.practice.riff;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** The user's favourite punchline for a day (table {@code riff_best_pick}). */
@Entity
@Table(name = "riff_best_pick")
public class RiffBestPick {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "prompt_date", nullable = false)
  private LocalDate promptDate;

  @Column(name = "joke_id", nullable = false)
  private Long jokeId;

  @Column(name = "picked_at", nullable = false)
  private Instant pickedAt = Instant.now();

  protected RiffBestPick() {}

  public RiffBestPick(UUID userId, LocalDate promptDate, Long jokeId) {
    this.userId = userId;
    this.promptDate = promptDate;
    this.jokeId = jokeId;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public LocalDate getPromptDate() { return promptDate; }
  public Long getJokeId() { return jokeId; }
  public Instant getPickedAt() { return pickedAt; }

  public void repick(Long jokeId) {
    this.jokeId = jokeId;
    this.pickedAt = Instant.now();
  }
}
