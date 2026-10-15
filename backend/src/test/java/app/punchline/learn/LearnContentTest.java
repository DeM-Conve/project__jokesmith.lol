package app.punchline.learn;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.EnumSet;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/** Guards the curated content: enough of it, and the model answers follow our own rules. */
class LearnContentTest {
  private final LearnContent content = new LearnContent(new ObjectMapper());
  private final JokeChecklist checklist = new JokeChecklist();

  @Test
  void hasACourseWorthOfContent() {
    assertThat(content.formulas()).hasSizeGreaterThanOrEqualTo(8);
    assertThat(content.premises()).hasSizeGreaterThanOrEqualTo(60);
    assertThat(content.gallery()).hasSizeGreaterThanOrEqualTo(40);
    var drilled = content.formulas().stream().map(LearnDtos.GymFormula::key).collect(Collectors.toSet());
    var answered = content.modelAnswers().stream().map(LearnDtos.ModelAnswer::formula).collect(Collectors.toSet());
    assertThat(answered).containsAll(drilled);
    for (var f : drilled) {
      assertThat(content.modelAnswers().stream().filter(a -> a.formula() == f).count()).as(f.name()).isGreaterThanOrEqualTo(6);
    }
  }

  @Test
  void everyModelAnswerEndsOnItsPunchWordAndUsesItsFormula() {
    var problems = new java.util.ArrayList<String>();
    for (var a : content.modelAnswers()) {
      var premise = content.premise(a.premiseId()).orElseThrow().text();
      var checks = checklist.check(a.formula(), premise, a.setup(), a.punchline());
      var failed = checks.stream().filter(c -> !c.passed()).map(LearnDtos.Check::key)
          .filter(k -> java.util.Set.of("punch-last", "economy", "no-explaining", "setup").contains(k)).toList();
      if (!failed.isEmpty()) problems.add(a.premiseId() + " " + a.formula() + " " + failed + ": " + a.punchline());
    }
    assertThat(problems).isEmpty();
  }

  @Test
  void galleryAnnotationsAreConsistent() {
    var formulas = EnumSet.allOf(JokeFormula.class);
    for (var g : content.gallery()) {
      assertThat(JokeText.flat(g.punchline())).as(g.id()).contains(JokeText.flat(g.punchWord()));
      assertThat(formulas).contains(g.formula());
      assertThat(g.targetAssumption()).isNotBlank();
      assertThat(g.reinterpretation()).isNotBlank();
      assertThat(XRayService.handXRay(g).punchWordLast()).as(g.id() + " punch word last").isTrue();
    }
  }
}
