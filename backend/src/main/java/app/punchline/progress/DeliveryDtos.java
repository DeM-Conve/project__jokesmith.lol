package app.punchline.progress;

import jakarta.validation.constraints.*;
import java.time.Instant;

/** Request/response bodies of /api/progress/delivery/**. */
public final class DeliveryDtos {
  private DeliveryDtos() {}

  public record BankJokeDto(long id, String setup, String punchline, String source, Instant createdAt) {}

  /**
   * Numeric analysis of one take, computed in the browser. Either {@code jokeId} (a joke
   * from the user's bank) or {@code setup}/{@code punchline} (typed ad hoc) identifies the joke.
   */
  public record TakeRequest(
      Long jokeId,
      @Size(max = 500) String setup,
      @Size(max = 500) String punchline,
      @Size(max = 4000) String transcript,
      @Min(0) @Max(600_000) int durationMs,
      @Min(0) @Max(600_000) int speechMs,
      @Min(0) @Max(5000) int wordCount,
      @PositiveOrZero @Max(1000) double wordsPerMinute,
      @Min(0) @Max(600_000) int prePunchPauseMs,
      @Min(0) @Max(600_000) int longestPauseMs,
      @Min(0) @Max(5000) int fillerCount,
      Boolean punchLast,
      @PositiveOrZero @Max(100) double energyVariance,
      @Min(0) @Max(100) int score) {}

  public record TakeDto(
      long id, Long jokeId, String jokeText, String transcript, int durationMs, int speechMs, int wordCount,
      double wordsPerMinute, int prePunchPauseMs, int longestPauseMs, int fillerCount, Boolean punchLast,
      double energyVariance, int score, Instant createdAt) {

    static TakeDto of(DeliveryTake t) {
      return new TakeDto(t.getId(), t.getJokeId(), t.getJokeText(), t.getTranscript(), t.getDurationMs(),
          t.getSpeechMs(), t.getWordCount(), round(t.getWordsPerMinute(), 10), t.getPrePunchPauseMs(),
          t.getLongestPauseMs(), t.getFillerCount(), t.getPunchLast(), round(t.getEnergyVariance(), 1000), t.getScore(),
          t.getCreatedAt());
    }

    /** REAL columns come back as float noise (163.60000610351562); trim to what was sent. */
    private static double round(float v, int scale) {
      return Math.round((double) v * scale) / (double) scale;
    }
  }

  /** The saved take plus the XP it earned. */
  public record TakeSaved(TakeDto take, int xp, long totalTakes) {}
}
