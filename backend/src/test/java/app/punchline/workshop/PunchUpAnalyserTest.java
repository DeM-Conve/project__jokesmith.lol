package app.punchline.workshop;

import static org.assertj.core.api.Assertions.assertThat;

import app.punchline.PostgresTestBase;
import app.punchline.workshop.punchup.PunchFix;
import app.punchline.workshop.punchup.PunchUpAnalyser;
import app.punchline.workshop.punchup.PunchUpAnalyser.Analysis;
import app.punchline.workshop.punchup.PunchUpAnalyser.Critique;
import app.punchline.workshop.punchup.PunchUpAnalyser.DiffOp;
import app.punchline.workshop.punchup.PunchUpAnalyser.Flag;
import app.punchline.workshop.punchup.PunchUpExamples;
import java.util.Arrays;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class PunchUpAnalyserTest extends PostgresTestBase {
  @Autowired PunchUpAnalyser analyser;
  @Autowired PunchUpExamples examples;

  private Flag flag(Analysis a, PunchFix fix) {
    return a.flags().stream().filter(f -> f.fix() == fix).findFirst().orElse(null);
  }

  @Test
  void curatedLibraryCoversEveryFix() {
    assertThat(examples.all()).hasSizeGreaterThanOrEqualTo(30);
    for (PunchFix fix : PunchFix.values()) assertThat(examples.forFix(fix)).as(fix.name()).hasSizeGreaterThanOrEqualTo(3);
  }

  @Test
  void flagsFillerWithExampleAndQuestion() {
    Analysis a = analyser.analyse("I just really don't think I'm a morning person.",
        "Basically I only kind of wake up when the coffee kicks in.");
    Flag f = flag(a, PunchFix.CUT_FILLER);
    assertThat(f).isNotNull();
    assertThat(f.words()).contains("just", "really", "basically", "kind of");
    assertThat(a.metrics().fillerWords()).isEqualTo(5);
    assertThat(f.question()).endsWith("?");
    assertThat(f.example()).isNotNull();
    assertThat(f.example().fix()).isEqualTo(PunchFix.CUT_FILLER);
  }

  @Test
  void flagsWeakLastWord() {
    Analysis a = analyser.analyse("I asked my speaker to play something relaxing.", "It turned off the news for me.");
    assertThat(a.metrics().weakEnding()).isTrue();
    Flag f = flag(a, PunchFix.END_ON_PUNCH);
    assertThat(f.finding()).contains("'me'").contains("'news'");
    assertThat(f.words()).containsExactly("for", "me");
  }

  @Test
  void strongEndingIsAStrength() {
    Analysis a = analyser.analyse("I asked my speaker to play something relaxing.", "It turned off the news.");
    assertThat(a.metrics().weakEnding()).isFalse();
    assertThat(a.flags()).extracting(Flag::fix).doesNotContain(PunchFix.END_ON_PUNCH, PunchFix.CUT_FILLER);
    assertThat(a.strengths()).anyMatch(s -> s.contains("'news'"));
  }

  @Test
  void flagsBuriedPunchWord() {
    Analysis a = analyser.analyse("I joined a gym in January.", "Forty dollars a month is what I've lost so far.");
    Flag f = flag(a, PunchFix.MOVE_PUNCH_LAST);
    assertThat(f).isNotNull();
    assertThat(a.metrics().wordsAfterPunch()).isGreaterThanOrEqualTo(3);
  }

  @Test
  void flagsLongSetupTwistRevealAndGenericNouns() {
    Analysis a = analyser.analyse(
        "So the other day I was at the big supermarket near my house in the long queue for the self-checkout which is always broken.",
        "It said unexpected item in bagging area.");
    assertThat(flag(a, PunchFix.TRIM_SETUP).finding()).contains("cut about");
    assertThat(a.metrics().cutTarget()).isGreaterThan(5);

    Analysis b = analyser.analyse("My cat acts like a manager at my laptop.", "She's not affectionate, she's management.");
    assertThat(flag(b, PunchFix.HIDE_THE_TWIST)).isNotNull();

    Analysis c = analyser.analyse("My mom keeps a lot of stuff in a drawer.", "It's a whole thing with her and things.");
    assertThat(flag(c, PunchFix.GET_SPECIFIC).words()).contains("stuff", "thing");
  }

  @Test
  void ruleOfThreeAndOneLiners() {
    assertThat(analyser.analyse("I've tried yoga, pilates, spin class and running.", "None of them stuck.")
        .metrics().listItems()).isEqualTo(4);
    assertThat(flag(analyser.analyse("I've tried yoga, pilates, spin class and running.", "None of them stuck."),
        PunchFix.RULE_OF_THREE)).isNotNull();
    Analysis three = analyser.analyse("My phone is at two percent.", "I've never been more productive, focused or afraid.");
    assertThat(three.metrics().listItems()).isEqualTo(3);
    assertThat(flag(three, PunchFix.RULE_OF_THREE)).isNull();

    Analysis one = analyser.analyse("", "Recipe blogs are annoying because I just want lasagna and now I know about your divorce.");
    assertThat(flag(one, PunchFix.SPLIT_SETUP).words()).containsExactly("because");
  }

  @Test
  void cleanJokeScoresHigherThanBloatedOne() {
    int clean = analyser.analyse("I joined a gym in January.", "So far I've lost forty dollars a month.").metrics().score();
    int bloated = analyser.analyse("So I basically joined a gym in January, like, honestly.",
        "And I've really just lost forty dollars a month so far, you know.").metrics().score();
    assertThat(clean).isGreaterThan(bloated + 20);
  }

  @Test
  void critiqueComparesBeforeAndAfter() {
    Critique c = analyser.critique("I asked my speaker to play something really relaxing.",
        "And then it just turned off the news for me.",
        "I asked my speaker to play something relaxing.", "It turned off the news.");
    assertThat(c.wordsAfter()).isLessThan(c.wordsBefore());
    assertThat(c.fillersCut()).contains("really", "just");
    assertThat(c.fixed()).contains(PunchFix.END_ON_PUNCH, PunchFix.CUT_FILLER);
    assertThat(c.scoreAfter()).isGreaterThan(c.scoreBefore());
    assertThat(c.notes()).anyMatch(n -> n.contains("Now ends on 'news'"));
    assertThat(c.diff()).anyMatch(t -> t.op() == DiffOp.REMOVED && t.text().equals("really"));
    assertThat(c.diff().stream().filter(t -> t.op() != DiffOp.REMOVED).map(t -> t.text()).toList())
        .containsExactlyElementsOf(Arrays.asList("I asked my speaker to play something relaxing It turned off the news".split(" ")));
  }

  @Test
  void movesAreInstructionsNotRewrites() {
    String s = "I asked my speaker to play something really relaxing.", p = "And then it turned off the news for me.";
    var moves = analyser.moves(s, p, analyser.analyse(s, p));
    assertThat(moves).anyMatch(m -> m.fix() == PunchFix.END_ON_PUNCH && m.instruction().contains("End on 'news'"));
    assertThat(moves).anyMatch(m -> m.fix() == PunchFix.CUT_FILLER && m.instruction().contains("'really'"));
    assertThat(moves).allMatch(m -> !m.instruction().contains("It turned off the news."));
  }
}
