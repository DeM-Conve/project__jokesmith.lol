package app.punchline.learn;

import app.punchline.core.ComedySkill;
import app.punchline.learn.LearnDtos.*;
import app.punchline.user.CurrentUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

/** HTTP only: the learn feature's curriculum, X-ray and Formula Gym endpoints. */
@RestController
@RequestMapping("/api/learn")
public class LearnController {
  private final LessonService lessons;
  private final XRayService xray;
  private final GymService gym;

  public LearnController(LessonService lessons, XRayService xray, GymService gym) {
    this.lessons = lessons;
    this.xray = xray;
    this.gym = gym;
  }

  // ---- Curriculum ----

  @GetMapping("/progress")
  public LearnProgress progress(@CurrentUser UUID userId) {
    return lessons.progress(userId);
  }

  @PostMapping("/lessons/{skill}/complete")
  public CompleteLessonResponse complete(@CurrentUser UUID userId, @PathVariable ComedySkill skill,
      @Valid @RequestBody CompleteLessonRequest body) {
    return lessons.complete(userId, skill, body);
  }

  // ---- X-ray ----

  @PostMapping("/xray")
  public XRay analyse(@CurrentUser UUID userId, @Valid @RequestBody XRayRequest body) {
    return xray.analyse(userId, body.text());
  }

  @GetMapping("/xray/gallery")
  public List<GalleryJoke> gallery() {
    return xray.gallery();
  }

  @PostMapping("/xray/annotate")
  public AnnotateResponse annotate(@CurrentUser UUID userId, @Valid @RequestBody AnnotateRequest body) {
    return xray.annotate(userId, body);
  }

  @GetMapping("/xray/history")
  public List<XRayHistoryItem> history(@CurrentUser UUID userId) {
    return xray.history(userId);
  }

  // ---- Formula Gym ----

  @GetMapping("/gym")
  public GymCatalogDto gymCatalog() {
    return gym.catalog();
  }

  @GetMapping("/gym/premise")
  public Premise premise(@RequestParam(required = false) String exclude) {
    return gym.randomPremise(exclude);
  }

  @PostMapping("/gym/attempts")
  public GymFeedback attempt(@CurrentUser UUID userId, @Valid @RequestBody GymAttemptRequest body) {
    return gym.attempt(userId, body);
  }

  @GetMapping("/gym/stats")
  public List<FormulaStat> stats(@CurrentUser UUID userId) {
    return gym.stats(userId);
  }
}
