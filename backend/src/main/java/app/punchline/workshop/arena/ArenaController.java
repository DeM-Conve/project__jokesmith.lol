package app.punchline.workshop.arena;

import app.punchline.user.CurrentUser;
import app.punchline.workshop.arena.ArenaService.Leaderboard;
import app.punchline.workshop.arena.ArenaService.MyArena;
import app.punchline.workshop.arena.ArenaService.Pair;
import app.punchline.workshop.arena.ArenaService.Period;
import app.punchline.workshop.arena.ArenaService.VoteResult;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workshop/arena")
public class ArenaController {
  public record VoteBody(@NotNull @Positive Long leftId, @NotNull @Positive Long rightId, Long winnerId) {}

  private final ArenaService arena;

  public ArenaController(ArenaService arena) {
    this.arena = arena;
  }

  @GetMapping("/pair")
  public Pair pair(@CurrentUser UUID userId, @RequestParam(defaultValue = "false") boolean samePrompt) {
    return arena.nextPair(userId, samePrompt);
  }

  @PostMapping("/votes")
  public VoteResult vote(@CurrentUser UUID userId, @Valid @RequestBody VoteBody body) {
    return arena.vote(userId, new ArenaService.VoteRequest(body.leftId(), body.rightId(), body.winnerId()));
  }

  @GetMapping("/leaderboard")
  public Leaderboard leaderboard(@CurrentUser UUID userId, @RequestParam(defaultValue = "ALL") Period period) {
    return arena.leaderboard(userId, period);
  }

  @GetMapping("/mine")
  public MyArena mine(@CurrentUser UUID userId) {
    return arena.mine(userId);
  }
}
