package app.punchline.learn;

import app.punchline.core.ComedySkill;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

/** Request/response bodies of the learn API. */
public final class LearnDtos {
  private LearnDtos() {}

  // ---- Curriculum ----

  public record LessonStatus(ComedySkill skill, int bestQuizCorrect, int quizTotal, int timesCompleted,
      Instant firstCompletedAt, Instant lastCompletedAt) {
    static LessonStatus of(LessonCompletion c) {
      return new LessonStatus(c.getSkill(), c.getBestQuizCorrect(), c.getQuizTotal(), c.getTimesCompleted(),
          c.getFirstCompletedAt(), c.getLastCompletedAt());
    }
  }

  public record LearnProgress(List<LessonStatus> lessons, int completedCount, int totalLessons, long xrayCount,
      long gymReps) {}

  public record CompleteLessonRequest(
      @Min(0) @Max(50) int quizCorrect,
      @Min(1) @Max(50) int quizTotal,
      @Size(max = 500) String setup,
      @Size(max = 500) String punchline,
      JokeFormula formula) {
    @AssertTrue(message = "quizCorrect must not exceed quizTotal")
    public boolean isScoreConsistent() {
      return quizCorrect <= quizTotal;
    }
  }

  public record CompleteLessonResponse(LessonStatus status, boolean firstCompletion, int xpAwarded, Long jokeId,
      List<Check> checks) {}

  // ---- Shared ----

  /** One line of a guided checklist. */
  public record Check(String key, String label, boolean passed, String tip) {}

  // ---- X-ray ----

  public record XRayRequest(@NotBlank @Size(max = 600) String text) {}

  public record XRay(
      String setup,
      String punchline,
      String targetAssumption,
      String connector,
      String reinterpretation,
      String punchWord,
      boolean punchWordLast,
      JokeFormula formula,
      String formulaLabel,
      List<JokeFormula> alsoSpotted,
      String whyItWorks,
      List<String> cues,
      List<String> tips,
      int wordCount,
      /** HAND_ANNOTATED (gallery) or ESTIMATE (the analyser). */
      String source,
      /** "high" for hand annotations, "medium"/"low" for estimates. */
      String confidence) {}

  public record GalleryJoke(String id, String setup, String punchline, String difficulty, List<String> tags,
      XRay xray) {}

  public record AnnotateRequest(
      @Size(max = 64) String galleryRef,
      @Size(max = 600) String text,
      @NotBlank @Size(max = 600) String punchline,
      @NotBlank @Size(max = 64) String punchWord,
      @NotNull JokeFormula formula,
      @Size(max = 400) String assumption) {
    @AssertTrue(message = "either galleryRef or text is required")
    public boolean isJokeGiven() {
      return (galleryRef != null && !galleryRef.isBlank()) || (text != null && !text.isBlank());
    }
  }

  public record AnnotateResponse(List<Check> checks, int passed, int total, XRay expected, String comparedWith) {}

  public record XRayHistoryItem(Long id, String mode, String galleryRef, String jokeText, JokeFormula formula,
      String punchWord, Short checksPassed, Short checksTotal, Instant createdAt) {
    static XRayHistoryItem of(XRayRun r) {
      return new XRayHistoryItem(r.getId(), r.getMode().name(), r.getGalleryRef(), r.getJokeText(), r.getFormula(),
          r.getPunchWord(), r.getChecksPassed(), r.getChecksTotal(), r.getCreatedAt());
    }
  }

  // ---- Formula Gym ----

  public record GymFormula(JokeFormula key, String label, String oneLiner, String howItWorks, String exampleSetup,
      String examplePunchline, String templateSetup, String templatePunchline, List<String> tips, String stretch) {}

  /** {@code keywords}: curated words that count as "on the premise" (bus for public transport). */
  public record Premise(String id, String text, String category, List<String> keywords) {}

  public record ModelAnswer(JokeFormula formula, String premiseId, String setup, String punchline, String note) {}

  public record GymCatalogDto(List<GymFormula> formulas, int premiseCount) {}

  public record GymAttemptRequest(
      @NotNull JokeFormula formula,
      @NotBlank @Size(max = 32) String premiseId,
      @Size(max = 500) String setup,
      @NotBlank @Size(max = 500) String punchline) {}

  public record GymFeedback(
      Long jokeId,
      JokeFormula formula,
      List<Check> checks,
      int passed,
      int total,
      String headline,
      String nextRep,
      /** Curated answers for this exact premise first, then the formula's other model answers. */
      List<ModelAnswer> modelAnswers,
      int xpAwarded) {}

  public record FormulaStat(JokeFormula formula, long reps, int bestPassed, int bestTotal) {}
}
