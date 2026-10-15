package app.jokesmith.practice.riff;

import app.jokesmith.practice.riff.RiffDtos.*;
import app.jokesmith.user.CurrentUser;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.*;

/** Daily Riff. Dates are the caller's local calendar day (ISO), so "today" is theirs. */
@RestController
@RequestMapping("/api/practice/riff")
public class RiffController {
  private final RiffService riffs;

  public RiffController(RiffService riffs) {
    this.riffs = riffs;
  }

  @GetMapping("/days/{date}")
  public RiffDayDto day(@CurrentUser UUID userId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate date) {
    return riffs.day(userId, date);
  }

  @PostMapping("/days/{date}")
  public RiffResultDto submit(@CurrentUser UUID userId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate date,
      @Valid @RequestBody SubmitRiffRequest body) {
    return riffs.submit(userId, date, body);
  }

  @PutMapping("/days/{date}/best")
  public RiffDayDto pick(@CurrentUser UUID userId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate date,
      @Valid @RequestBody PickRequest body) {
    return riffs.pick(userId, date, body.jokeId());
  }

  @GetMapping("/days/{date}/picks")
  public List<PeerPickDto> picks(@CurrentUser UUID userId, @PathVariable @DateTimeFormat(iso = ISO.DATE) LocalDate date) {
    return riffs.peerPicks(userId, date);
  }

  /** Days before {@code today}, newest first. */
  @GetMapping("/archive")
  public List<ArchiveDayDto> archive(@CurrentUser UUID userId,
      @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate today,
      @RequestParam(defaultValue = "60") int limit) {
    return riffs.archive(userId, today, limit);
  }
}
