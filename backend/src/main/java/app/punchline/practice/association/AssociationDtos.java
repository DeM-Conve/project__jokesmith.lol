package app.punchline.practice.association;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.Map;

/** Request/response bodies of the association mapper API. */
public final class AssociationDtos {
  private AssociationDtos() {}

  public record CategoryDto(AssociationCategory key, String label, String hint) {}

  public record TopicsDto(List<String> topics, List<CategoryDto> categories, List<String> tips) {}

  public record ItemDto(@NotNull AssociationCategory category, @NotBlank @Size(max = 80) String text) {}

  public record StartRequest(@NotBlank @Size(max = 80) String topic, @NotNull @Size(max = 150) List<@Valid ItemDto> items) {}

  public record CollisionItemDto(AssociationCategory category, String text, boolean suggested) {}

  public record CollisionDto(CollisionItemDto a, CollisionItemDto b, int surprise, String why, String prompt) {}

  /**
   * A map after the brainstorm. {@code suggestions} are curated associations the user
   * didn't think of (only shown after they've brainstormed), keyed by category.
   */
  public record MapDto(
      long id,
      String topic,
      String curatedTopic,
      List<ItemDto> items,
      Map<AssociationCategory, List<String>> suggestions,
      List<CollisionDto> collisions,
      List<String> tips,
      int jokes) {}

  public record JokeRequest(
      @NotBlank @Size(max = 80) String a,
      @NotBlank @Size(max = 80) String b,
      @Size(max = 500) String setup,
      @NotBlank @Size(max = 500) String punchline) {}

  public record JokeResultDto(long jokeId, int xp, int jokes) {}
}
