package app.punchline.practice.association;

import app.punchline.practice.association.AssociationDtos.*;
import app.punchline.user.CurrentUser;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/practice/associate")
public class AssociationController {
  private final AssociationService maps;

  public AssociationController(AssociationService maps) {
    this.maps = maps;
  }

  @GetMapping("/topics")
  public TopicsDto topics() {
    return maps.topics();
  }

  /** Finish the timed brainstorm: saves the map and returns suggestions and collisions. */
  @PostMapping("/sessions")
  public MapDto start(@CurrentUser UUID userId, @Valid @RequestBody StartRequest body) {
    return maps.start(userId, body);
  }

  /** {@code shuffle} re-rolls the collisions. */
  @GetMapping("/sessions/{id}")
  public MapDto get(@CurrentUser UUID userId, @PathVariable long id, @RequestParam(defaultValue = "0") int shuffle) {
    return maps.get(userId, id, shuffle);
  }

  /** Adopt a suggestion (or add a late idea) into the map. */
  @PostMapping("/sessions/{id}/items")
  public MapDto addItem(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody ItemDto body) {
    return maps.addItem(userId, id, body);
  }

  @PostMapping("/sessions/{id}/jokes")
  public JokeResultDto joke(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody JokeRequest body) {
    return maps.writeJoke(userId, id, body);
  }
}
