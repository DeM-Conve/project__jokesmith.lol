package app.punchline.practice.banter;

import app.punchline.core.ComedySkill;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/** Request/response bodies of the banter simulator API. */
public final class BanterDtos {
  private BanterDtos() {}

  public record PersonaDto(BanterPersona key, String label, String description, int lines) {}

  public record TechniqueDto(BanterTechnique key, String label, String description) {}

  public record SetupDto(List<PersonaDto> personas, List<TechniqueDto> techniques, List<Integer> timers, int rounds) {}

  public record StartRequest(@NotNull BanterPersona persona, @NotNull Integer secondsLimit) {}

  public record ExampleDto(BanterTechnique technique, String label, String text) {}

  /** A round's result: only present once answered (try first, then see the examples). */
  public record ResultDto(
      String reply,
      boolean timedOut,
      int wit,
      int surprise,
      int kindness,
      int total,
      String verdict,
      BanterTechnique spotted,
      String tip,
      ExampleDto example,
      List<ExampleDto> moreExamples,
      BanterSelfRating selfRating,
      boolean saved) {}

  public record RoundDto(int roundNo, String line, ResultDto result) {}

  public record SessionDto(
      long id,
      BanterPersona persona,
      int secondsLimit,
      List<RoundDto> rounds,
      boolean complete,
      Integer xp,
      ComedySkill skill) {}

  public record ReplyRequest(@Size(max = 300) String reply, @NotNull @Min(0) @Max(600_000) Integer responseMs) {}

  public record SelfRatingRequest(@NotNull BanterSelfRating rating) {}
}
