package app.punchline.practice.riff;

import app.punchline.core.ComedySkill;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** Request/response bodies of the daily riff API. */
public final class RiffDtos {
  private RiffDtos() {}

  public record PunchlineDto(long id, String text) {}

  /**
   * A day's riff as the caller sees it. {@code modelPunchlines} stays null until the
   * caller has riffed this day: try first, then compare.
   */
  public record RiffDayDto(
      LocalDate date,
      long number,
      String setup,
      int sessions,
      List<PunchlineDto> punchlines,
      Long bestJokeId,
      List<String> modelPunchlines) {}

  public record SubmitRiffRequest(
      @NotEmpty @Size(max = 100) List<@NotNull @Size(min = 1, max = 500) String> punchlines,
      @Min(0) @Max(3600) int secondsUsed) {}

  public record RiffResultDto(RiffDayDto day, int saved, int xp, ComedySkill skill) {}

  public record PickRequest(@NotNull Long jokeId) {}

  public record PeerPickDto(String handle, String punchline, boolean mine) {}

  public record ArchiveDayDto(LocalDate date, long number, String setup, boolean riffed) {}
}
