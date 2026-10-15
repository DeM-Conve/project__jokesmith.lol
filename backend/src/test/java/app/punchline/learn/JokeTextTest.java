package app.punchline.learn;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class JokeTextTest {
  private final XRayAnalyzer analyzer = new XRayAnalyzer();

  @Test
  void splitsAtLastSentenceBoundary() {
    var s = JokeText.split("I've been going to the gym religiously. Christmas and Easter.");
    assertThat(s.setup()).isEqualTo("I've been going to the gym religiously.");
    assertThat(s.punchline()).isEqualTo("Christmas and Easter.");
  }

  @Test
  void splitsSingleSentenceAtAPause() {
    assertThat(JokeText.split("My bus is so late — the timetable is now historical fiction.").punchline())
        .isEqualTo("the timetable is now historical fiction.");
    assertThat(JokeText.split("I tried to be sensible about money, but my cat has other plans.").punchline())
        .isEqualTo("but my cat has other plans.");
    assertThat(JokeText.split("Hello").setup()).isEmpty();
  }

  @Test
  void punchWordSkipsTrailingFiller() {
    assertThat(JokeText.punchWord("Spread across the week.")).isEqualTo("week");
    assertThat(JokeText.punchWord("I just believe in it from bed, honestly.")).isEqualTo("bed");
    assertThat(JokeText.punchWordLast("I just believe in it from bed, honestly.")).isFalse();
    assertThat(JokeText.trailing("I just believe in it from bed, honestly.")).containsExactly("honestly");
  }

  @Test
  void detectsFormulasFromCues() {
    assertThat(analyzer.analyse("Christmas with my family means turkey, presents and a hostage situation.").formula())
        .isEqualTo(JokeFormula.RULE_OF_THREE);
    assertThat(analyzer.analyse("My smart speaker is like a teenager. It only listens when I'm saying something private.").formula())
        .isEqualTo(JokeFormula.COMPARISON);
    assertThat(analyzer.analyse("My dad told me to follow my dreams. So I went back to bed.").formula())
        .isEqualTo(JokeFormula.LITERAL);
    assertThat(analyzer.analyse("If a budget airline ran a hospital: surgery is free, anaesthetic is fifteen euros.").formula())
        .isEqualTo(JokeFormula.MASHUP);
    assertThat(analyzer.analyse("Airport security is weird. Nothing makes me look guiltier than trying to look innocent.").formula())
        .isEqualTo(JokeFormula.ATTITUDE);
    assertThat(analyzer.analyse("My commute is so long I've started getting 300 letters a week on the train.").formula())
        .isEqualTo(JokeFormula.EXAGGERATION);
    assertThat(analyzer.analyse("Our office printer is so old, it prints in Latin.").formula())
        .isEqualTo(JokeFormula.EXAGGERATION);
    assertThat(analyzer.analyse("I sang at karaoke and got a standing ovation. Everyone stood up to leave.").formula())
        .isIn(JokeFormula.WORDPLAY, JokeFormula.MISDIRECTION);
  }

  @Test
  void analysisIsLabelledAsAnEstimate() {
    var x = analyzer.analyse("I've finally started getting eight hours of sleep a night. Spread across the week.");
    assertThat(x.source()).isEqualTo("ESTIMATE");
    assertThat(x.confidence()).isIn("low", "medium");
    assertThat(x.punchWord()).isEqualTo("week");
    assertThat(x.punchWordLast()).isTrue();
    assertThat(x.targetAssumption()).isNotBlank();
    assertThat(x.whyItWorks()).contains("week");
  }

  @Test
  void checklistFlagsTrailingPunchWordAndRewardsAList() {
    var checklist = new JokeChecklist();
    var weak = checklist.check(JokeFormula.RULE_OF_THREE, "Yoga classes",
        "Yoga", "it is fine I guess lol");
    assertThat(weak).filteredOn(c -> !c.passed()).extracting(LearnDtos.Check::key)
        .contains("setup", "no-explaining", "three-items");
    var strong = checklist.check(JokeFormula.RULE_OF_THREE, "Yoga classes",
        "Yoga has taught me balance, patience", "and the exact location of the clock.");
    assertThat(strong).allMatch(LearnDtos.Check::passed);
    // Curated premise keywords: a bus joke is on the "Public transport" premise.
    var bus = checklist.check(JokeFormula.EXAGGERATION, "Public transport", java.util.List.of("bus", "timetable"),
        "My bus is so late these days,", "I have started paying it rent.");
    assertThat(bus).allMatch(LearnDtos.Check::passed);
  }
}
