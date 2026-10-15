package app.jokesmith.practice.banter;

import app.jokesmith.practice.banter.BanterDtos.*;
import app.jokesmith.user.CurrentUser;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/practice/banter")
public class BanterController {
  private final BanterService banter;

  public BanterController(BanterService banter) {
    this.banter = banter;
  }

  @GetMapping("/setup")
  public SetupDto setup() {
    return banter.setup();
  }

  @PostMapping("/sessions")
  public SessionDto start(@CurrentUser UUID userId, @Valid @RequestBody StartRequest body) {
    return banter.start(userId, body);
  }

  @GetMapping("/sessions/{id}")
  public SessionDto get(@CurrentUser UUID userId, @PathVariable long id) {
    return banter.get(userId, id);
  }

  @PostMapping("/sessions/{id}/rounds/{roundNo}/reply")
  public SessionDto reply(@CurrentUser UUID userId, @PathVariable long id, @PathVariable int roundNo,
      @Valid @RequestBody ReplyRequest body) {
    return banter.reply(userId, id, roundNo, body);
  }

  @PutMapping("/sessions/{id}/rounds/{roundNo}/self-rating")
  public SessionDto rate(@CurrentUser UUID userId, @PathVariable long id, @PathVariable int roundNo,
      @Valid @RequestBody SelfRatingRequest body) {
    return banter.rate(userId, id, roundNo, body.rating());
  }
}
