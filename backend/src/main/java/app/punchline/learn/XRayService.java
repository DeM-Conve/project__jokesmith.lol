package app.punchline.learn;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.learn.LearnContent.GalleryEntry;
import app.punchline.learn.LearnDtos.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Joke X-ray: automatic analysis, the hand-annotated gallery, and self-annotation practice. */
@Service
public class XRayService {
  static final int XP = 10;

  private final XRayAnalyzer analyzer;
  private final LearnContent content;
  private final XRayRunRepository runs;
  private final ActivityLog activity;

  public XRayService(XRayAnalyzer analyzer, LearnContent content, XRayRunRepository runs, ActivityLog activity) {
    this.analyzer = analyzer;
    this.content = content;
    this.runs = runs;
    this.activity = activity;
  }

  @Transactional
  public XRay analyse(UUID userId, String text) {
    String clean = JokeText.clean(text);
    if (JokeText.wordCount(clean) < 2) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paste a whole joke: at least a few words.");
    }
    XRay x = analyzer.analyse(clean);
    runs.save(new XRayRun(userId, XRayMode.AUTO, null, clean, x.formula(), x.punchWord(), null, null));
    activity.record(userId, ComedySkill.ANATOMY, XP);
    return x;
  }

  public List<GalleryJoke> gallery() {
    return content.gallery().stream().map(XRayService::toGalleryJoke).toList();
  }

  static GalleryJoke toGalleryJoke(GalleryEntry e) {
    return new GalleryJoke(e.id(), e.setup(), e.punchline(), e.difficulty(), e.tags(), handXRay(e));
  }

  static XRay handXRay(GalleryEntry e) {
    String full = e.setup() + " " + e.punchline();
    boolean last = JokeText.flat(e.punchline()).endsWith(JokeText.flat(e.punchWord()));
    return new XRay(e.setup(), e.punchline(), e.targetAssumption(), e.connector(), e.reinterpretation(), e.punchWord(),
        last, e.formula(), e.formula().label(), e.alsoAccept(), e.whyItWorks(), List.of(), List.of(),
        JokeText.wordCount(full), "HAND_ANNOTATED", "high");
  }

  /** Compare the user's own annotation with the hand annotation (gallery) or the analyser's estimate. */
  @Transactional
  public AnnotateResponse annotate(UUID userId, AnnotateRequest req) {
    XRay expected;
    Set<JokeFormula> accepted;
    String text;
    String comparedWith;
    String galleryRef = null;
    if (req.galleryRef() != null && !req.galleryRef().isBlank()) {
      GalleryEntry e = content.galleryEntry(req.galleryRef())
          .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No gallery joke " + req.galleryRef()));
      expected = handXRay(e);
      accepted = new java.util.HashSet<>(e.alsoAccept());
      accepted.add(e.formula());
      text = e.setup() + " " + e.punchline();
      comparedWith = "HAND_ANNOTATED";
      galleryRef = e.id();
    } else {
      text = JokeText.clean(req.text());
      expected = analyzer.analyse(text);
      accepted = new java.util.HashSet<>(expected.alsoSpotted());
      accepted.add(expected.formula());
      comparedWith = "ESTIMATE";
    }

    String fullFlat = JokeText.flat(text);
    String userPunch = JokeText.flat(req.punchline());
    if (!fullFlat.endsWith(userPunch)) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The punchline must be the end of the joke.");
    }
    List<Check> checks = new ArrayList<>();

    int userPunchWords = JokeText.wordCount(req.punchline());
    int expectedPunchWords = JokeText.wordCount(expected.punchline());
    int diff = Math.abs(userPunchWords - expectedPunchWords);
    checks.add(new Check("split", "You found where the setup turns into the punch", diff <= 2,
        diff <= 2 ? "Spot on: the turn comes at \"" + JokeText.clip(expected.punchline(), 4) + "\"."
            : "The turn comes at \"" + JokeText.clip(expected.punchline(), 6) + "\". Everything before it builds the assumption; the punch starts where the picture changes."));

    boolean pwMatch = JokeText.flat(req.punchWord()).equals(JokeText.flat(expected.punchWord()));
    checks.add(new Check("punch-word", "You spotted the punch word", pwMatch,
        pwMatch ? "Yes: \"" + expected.punchWord() + "\" is the word that makes the picture flip."
            : "The punch word is \"" + expected.punchWord() + "\", the single word where the second meaning becomes undeniable."));

    boolean formulaMatch = accepted.contains(req.formula());
    checks.add(new Check("formula", "You named the formula", formulaMatch,
        formulaMatch ? "Right: " + expected.formulaLabel() + "."
            : "This one is mainly " + expected.formulaLabel() + ". " + firstSentence(expected.whyItWorks())));

    String assumption = req.assumption() == null ? "" : req.assumption();
    boolean wrote = JokeText.wordCount(assumption) >= 3;
    var mine = JokeText.contentStems(assumption);
    var theirs = JokeText.contentStems(expected.targetAssumption() + " " + expected.connector());
    boolean overlap = mine.stream().anyMatch(theirs::contains);
    checks.add(new Check("assumption", "You described the target assumption", wrote && overlap,
        !wrote ? "Write the assumption in a sentence: what does the audience believe right before the punch?"
            : overlap ? "Your assumption is in the right area. Compare the wording with the annotation below."
                : "Compare yours with the annotation: \"" + expected.targetAssumption() + "\" The assumption is what the setup makes you picture, not what the joke is about."));

    int passed = (int) checks.stream().filter(Check::passed).count();
    runs.save(new XRayRun(userId, XRayMode.SELF_ANNOTATED, galleryRef, text, req.formula(), req.punchWord(), passed,
        checks.size()));
    activity.record(userId, ComedySkill.ANATOMY, XP);
    return new AnnotateResponse(checks, passed, checks.size(), expected, comparedWith);
  }

  public List<XRayHistoryItem> history(UUID userId) {
    return runs.findTop10ByUserIdOrderByCreatedAtDesc(userId).stream().map(XRayHistoryItem::of).toList();
  }

  private static String firstSentence(String s) {
    int dot = s.indexOf(". ");
    return dot < 0 ? s : s.substring(0, dot + 1);
  }
}
