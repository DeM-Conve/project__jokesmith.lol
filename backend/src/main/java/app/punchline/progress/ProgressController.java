package app.punchline.progress;

import app.punchline.progress.DeliveryDtos.*;
import app.punchline.progress.ProgressDtos.*;
import app.punchline.user.CurrentUser;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

/** HTTP only: Today, the Funny Radar and the Delivery Lab. */
@RestController
@RequestMapping("/api/progress")
public class ProgressController {
  private final ProgressService progress;
  private final DeliveryService delivery;

  public ProgressController(ProgressService progress, DeliveryService delivery) {
    this.progress = progress;
    this.delivery = delivery;
  }

  /** @param tz the browser's IANA zone (e.g. Asia/Kolkata); days and streaks are counted in it. */
  @GetMapping("/today")
  public TodayDto today(@CurrentUser UUID userId, @RequestParam(required = false) String tz) {
    return progress.today(userId, ProgressService.zone(tz), Instant.now());
  }

  @GetMapping("/radar")
  public RadarDto radar(@CurrentUser UUID userId, @RequestParam(required = false) String tz) {
    return progress.radar(userId, ProgressService.zone(tz), Instant.now());
  }

  @GetMapping("/delivery/jokes")
  public List<BankJokeDto> bank(@CurrentUser UUID userId) {
    return delivery.bank(userId);
  }

  @GetMapping("/delivery/takes")
  public List<TakeDto> takes(@CurrentUser UUID userId) {
    return delivery.recent(userId);
  }

  @PostMapping("/delivery/takes")
  @ResponseStatus(HttpStatus.CREATED)
  public TakeSaved saveTake(@CurrentUser UUID userId, @Valid @RequestBody TakeRequest body) {
    return delivery.save(userId, body);
  }
}
