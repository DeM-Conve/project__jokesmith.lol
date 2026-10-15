package app.jokesmith.workshop.punchup;

import app.jokesmith.user.CurrentUser;
import app.jokesmith.workshop.punchup.PunchUpService.Moves;
import app.jokesmith.workshop.punchup.PunchUpService.Session;
import app.jokesmith.workshop.punchup.PunchUpService.Summary;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workshop/punchup")
public class PunchUpController {
  public record StartBody(@Size(max = 500) String setup, @Size(max = 500) String punchline, Long fromJokeId) {}

  public record RewriteBody(@Size(max = 500) String setup, @NotBlank @Size(max = 500) String punchline) {}

  public record AnalyseBody(@Size(max = 500) String setup, @NotBlank @Size(max = 500) String punchline) {}

  private final PunchUpService punchUp;
  private final PunchUpAnalyser analyser;
  private final PunchUpExamples examples;

  public PunchUpController(PunchUpService punchUp, PunchUpAnalyser analyser, PunchUpExamples examples) {
    this.punchUp = punchUp;
    this.analyser = analyser;
    this.examples = examples;
  }

  @GetMapping
  public List<Summary> recent(@CurrentUser UUID userId) {
    return punchUp.recent(userId);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Session start(@CurrentUser UUID userId, @Valid @RequestBody StartBody body) {
    return punchUp.start(userId, body.setup(), body.punchline(), body.fromJokeId());
  }

  @GetMapping("/{id}")
  public Session get(@CurrentUser UUID userId, @PathVariable long id) {
    return punchUp.get(userId, id);
  }

  @PostMapping("/{id}/rewrites")
  public Session rewrite(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody RewriteBody body) {
    return punchUp.rewrite(userId, id, body.setup(), body.punchline());
  }

  @GetMapping("/{id}/moves")
  public Moves moves(@CurrentUser UUID userId, @PathVariable long id) {
    return punchUp.moves(userId, id);
  }

  @PostMapping("/{id}/arena")
  public Session sendToArena(@CurrentUser UUID userId, @PathVariable long id) {
    return punchUp.sendToArena(userId, id);
  }

  /** Live draft feedback while typing: stateless, saves nothing. */
  @PostMapping("/analyse")
  public PunchUpAnalyser.Analysis analyse(@Valid @RequestBody AnalyseBody body) {
    return analyser.analyse(body.setup(), body.punchline());
  }

  /** The curated before/after library, for browsing. */
  @GetMapping("/examples")
  public List<PunchUpExamples.Example> examples() {
    return examples.all();
  }
}
