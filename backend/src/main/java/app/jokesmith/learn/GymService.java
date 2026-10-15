package app.jokesmith.learn;

import app.jokesmith.core.ActivityLog;
import app.jokesmith.core.ComedySkill;
import app.jokesmith.core.Joke;
import app.jokesmith.core.JokeBank;
import app.jokesmith.core.JokeSource;
import app.jokesmith.learn.LearnDtos.*;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Formula Gym: drills, premises, rule-based feedback and curated model answers. */
@Service
public class GymService {
  static final int XP = 25;
  static final int MODEL_ANSWERS_SHOWN = 3;

  private final LearnContent content;
  private final JokeChecklist checklist;
  private final JokeBank bank;
  private final ActivityLog activity;
  private final GymAttemptRepository attempts;

  public GymService(LearnContent content, JokeChecklist checklist, JokeBank bank, ActivityLog activity,
      GymAttemptRepository attempts) {
    this.content = content;
    this.checklist = checklist;
    this.bank = bank;
    this.activity = activity;
    this.attempts = attempts;
  }

  public GymCatalogDto catalog() {
    return new GymCatalogDto(content.formulas(), content.premises().size());
  }

  /** A random premise, avoiding {@code exclude} when possible. */
  public Premise randomPremise(String exclude) {
    List<Premise> all = content.premises();
    Premise p;
    do {
      p = all.get(ThreadLocalRandom.current().nextInt(all.size()));
    } while (all.size() > 1 && p.id().equals(exclude));
    return p;
  }

  @Transactional
  public GymFeedback attempt(UUID userId, GymAttemptRequest req) {
    Premise premise = content.premise(req.premiseId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown premise " + req.premiseId()));
    GymFormula formula = content.formula(req.formula())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, req.formula() + " has no drill"));

    String setup = req.setup() == null ? "" : req.setup().strip();
    String punch = req.punchline().strip();
    List<Check> checks = checklist.check(req.formula(), premise.text(),
        premise.keywords() == null ? List.of() : premise.keywords(), setup, punch);
    int passed = (int) checks.stream().filter(Check::passed).count();

    Joke joke = bank.save(userId, setup, punch, JokeSource.FORMULA_GYM, "gym:" + req.formula().name() + ":" + premise.id());
    attempts.save(new GymAttempt(userId, joke.getId(), req.formula(), premise.id(), passed, checks.size()));
    activity.record(userId, ComedySkill.FORMULAS, XP);

    String headline;
    double ratio = (double) passed / checks.size();
    if (ratio == 1.0) headline = "Clean build. Every rule checks out. Now read it aloud and listen for the last word.";
    else if (ratio >= 0.7) headline = "Solid bones. One or two fixes and it's stage-ready.";
    else if (ratio >= 0.4) headline = "There's a joke in here. The checklist shows where it's hiding.";
    else headline = "Rough draft, which is exactly what drafts are for. Fix the first miss and go again.";

    String nextRep = checks.stream().filter(c -> !c.passed()).findFirst()
        .map(c -> "Next rep: " + c.tip())
        .orElse("Next rep: " + formula.stretch());

    return new GymFeedback(joke.getId(), req.formula(), checks, passed, checks.size(), headline, nextRep,
        modelAnswers(req.formula(), premise.id()), XP);
  }

  /** Curated answers for this premise first, then others for the same formula. */
  List<ModelAnswer> modelAnswers(JokeFormula formula, String premiseId) {
    List<ModelAnswer> exact = new ArrayList<>();
    List<ModelAnswer> sameFormula = new ArrayList<>();
    List<ModelAnswer> samePremise = new ArrayList<>();
    for (ModelAnswer a : content.modelAnswers()) {
      boolean f = a.formula() == formula;
      boolean p = a.premiseId().equals(premiseId);
      if (f && p) exact.add(a);
      else if (f) sameFormula.add(a);
      else if (p) samePremise.add(a);
    }
    java.util.Collections.shuffle(sameFormula);
    List<ModelAnswer> out = new ArrayList<>(exact);
    out.addAll(samePremise.stream().limit(1).toList());
    for (ModelAnswer a : sameFormula) {
      if (out.size() >= MODEL_ANSWERS_SHOWN) break;
      out.add(a);
    }
    return out;
  }

  public List<FormulaStat> stats(UUID userId) {
    Map<JokeFormula, long[]> agg = new EnumMap<>(JokeFormula.class);
    Map<JokeFormula, GymAttempt> best = new EnumMap<>(JokeFormula.class);
    for (GymAttempt a : attempts.findByUserId(userId)) {
      agg.computeIfAbsent(a.getFormula(), k -> new long[1])[0]++;
      GymAttempt b = best.get(a.getFormula());
      if (b == null || (double) a.getChecksPassed() / a.getChecksTotal() > (double) b.getChecksPassed() / b.getChecksTotal()) {
        best.put(a.getFormula(), a);
      }
    }
    List<FormulaStat> out = new ArrayList<>();
    for (GymFormula f : content.formulas()) {
      GymAttempt b = best.get(f.key());
      out.add(new FormulaStat(f.key(), agg.containsKey(f.key()) ? agg.get(f.key())[0] : 0,
          b == null ? 0 : b.getChecksPassed(), b == null ? 0 : b.getChecksTotal()));
    }
    return out;
  }

  public long totalReps(UUID userId) {
    return attempts.findByUserId(userId).size();
  }
}
