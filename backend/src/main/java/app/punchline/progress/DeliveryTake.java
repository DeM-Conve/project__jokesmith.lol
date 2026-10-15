package app.punchline.progress;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/** One recorded Delivery Lab take: metrics only, the audio never leaves the browser. */
@Entity
@Table(name = "delivery_take")
public class DeliveryTake {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "joke_id")
  private Long jokeId;

  @Column(name = "joke_text", nullable = false, length = 1000)
  private String jokeText;

  @Column(nullable = false, length = 4000)
  private String transcript;

  @Column(name = "duration_ms", nullable = false)
  private int durationMs;

  @Column(name = "speech_ms", nullable = false)
  private int speechMs;

  @Column(name = "word_count", nullable = false)
  private short wordCount;

  @Column(name = "words_per_minute", nullable = false)
  private float wordsPerMinute;

  @Column(name = "pre_punch_pause_ms", nullable = false)
  private int prePunchPauseMs;

  @Column(name = "longest_pause_ms", nullable = false)
  private int longestPauseMs;

  @Column(name = "filler_count", nullable = false)
  private short fillerCount;

  @Column(name = "punch_last")
  private Boolean punchLast;

  @Column(name = "energy_variance", nullable = false)
  private float energyVariance;

  @Column(nullable = false)
  private short score;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected DeliveryTake() {}

  public DeliveryTake(UUID userId, Long jokeId, String jokeText, String transcript, int durationMs, int speechMs,
      int wordCount, float wordsPerMinute, int prePunchPauseMs, int longestPauseMs, int fillerCount,
      Boolean punchLast, float energyVariance, int score) {
    this.userId = userId;
    this.jokeId = jokeId;
    this.jokeText = jokeText;
    this.transcript = transcript == null ? "" : transcript;
    this.durationMs = durationMs;
    this.speechMs = speechMs;
    this.wordCount = (short) wordCount;
    this.wordsPerMinute = wordsPerMinute;
    this.prePunchPauseMs = prePunchPauseMs;
    this.longestPauseMs = longestPauseMs;
    this.fillerCount = (short) fillerCount;
    this.punchLast = punchLast;
    this.energyVariance = energyVariance;
    this.score = (short) score;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public Long getJokeId() { return jokeId; }
  public String getJokeText() { return jokeText; }
  public String getTranscript() { return transcript; }
  public int getDurationMs() { return durationMs; }
  public int getSpeechMs() { return speechMs; }
  public int getWordCount() { return wordCount; }
  public float getWordsPerMinute() { return wordsPerMinute; }
  public int getPrePunchPauseMs() { return prePunchPauseMs; }
  public int getLongestPauseMs() { return longestPauseMs; }
  public int getFillerCount() { return fillerCount; }
  public Boolean getPunchLast() { return punchLast; }
  public float getEnergyVariance() { return energyVariance; }
  public int getScore() { return score; }
  public Instant getCreatedAt() { return createdAt; }
}
