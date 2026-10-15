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
    assertThat(content.premises()).hasSizeGreaterThanOrEqualTo(60)
        .allSatisfy(p -> assertThat(p.keywords()).as(p.id()).isNotEmpty());
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
      var premise = content.premise(a.premiseId()).orElseThrow();
      var checks = checklist.check(a.formula(), premise.text(), premise.keywords(), a.setup(), a.punchline());
      var failed = checks.stream().filter(c -> !c.passed()).map(LearnDtos.Check::key)
          .filter(k -> java.util.Set.of("punch-last", "economy", "no-explaining", "setup", "on-premise").contains(k)).toList();
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
      assertThat(g.targetAssumption()).as(g.id()).isNotBlank();
      assertThat(g.connector()).as(g.id()).isNotBlank();
      assertThat(g.reinterpretation()).as(g.id()).isNotBlank();
      assertThat(g.whyItWorks()).as(g.id()).isNotBlank();
      // Real jokes sometimes break our "punch word last" rule on purpose. That's allowed for a
      // credited joke, but the annotation has to say why (it mentions the word "last").
      if (!XRayService.handXRay(g).punchWordLast()) {
        assertThat(g.whyItWorks().toLowerCase()).as(g.id() + " explains why the punch word isn't last").contains("last");
      }
    }
  }

  @Test
  void everyGalleryJokeIsCreditedAndVerified() {
    for (var g : content.gallery()) {
      assertThat(g.comedian()).as(g.id() + " comedian").isNotBlank();
      assertThat(g.source()).as(g.id() + " source").isNotBlank();
      assertThat(g.sourceUrl()).as(g.id() + " sourceUrl").startsWith("https://");
      assertThat(XRayService.handXRay(g).credit().comedian()).isEqualTo(g.comedian());
    }
    var jokes = content.gallery().stream().map(g -> JokeText.flat(g.setup() + " " + g.punchline())).toList();
    assertThat(jokes).doesNotHaveDuplicates();
  }

  @Test
  void galleryCoversEveryDrilledFormula() {
    var inGallery = content.gallery().stream().map(LearnContent.GalleryEntry::formula).collect(Collectors.toSet());
    var drilled = content.formulas().stream().map(LearnDtos.GymFormula::key).collect(Collectors.toSet());
    assertThat(inGallery).containsAll(drilled);
  }

  @Test
  void everyFormulaExampleIsAFamousCreditedJoke() {
    for (var f : content.formulas()) {
      assertThat(f.exampleCredit()).as(f.key() + " exampleCredit").isNotNull();
      assertThat(f.exampleCredit().comedian()).as(f.key().name()).isNotBlank();
      assertThat(f.exampleCredit().sourceUrl()).as(f.key().name()).startsWith("https://");
    }
  }

  @Test
  void modelAnswersStayOriginal() {
    // Model answers answer our own premises, so they must never be a famous joke.
    var famous = content.gallery().stream().map(g -> JokeText.flat(g.punchline()))
        .collect(Collectors.toCollection(java.util.HashSet::new));
    content.formulas().forEach(f -> famous.add(JokeText.flat(f.examplePunchline())));
    for (var a : content.modelAnswers()) {
      assertThat(famous).as(a.premiseId() + " " + a.formula()).doesNotContain(JokeText.flat(a.punchline()));
    }
  }
}
