package app.punchline.practice;

import static org.assertj.core.api.Assertions.assertThat;

import app.punchline.practice.banter.BanterScorer;
import app.punchline.practice.banter.BanterScorer.Score;
import app.punchline.practice.banter.BanterTechnique;
import org.junit.jupiter.api.Test;

class BanterScorerTest {
  private static final String LINE = "I just adopted a cat.";

  @Test
  void silenceTimesOut() {
    Score s = BanterScorer.score(LINE, "  ", 3000, 10);
    assertThat(s.timedOut()).isTrue();
    assertThat(s.wit()).isEqualTo(1);
    assertThat(s.tip()).contains("Silence");
  }

  @Test
  void justAgreeingIsFlat() {
    Score s = BanterScorer.score(LINE, "aw nice", 2000, 10);
    assertThat(s.wit()).isLessThanOrEqualTo(2);
    assertThat(s.surprise()).isEqualTo(1);
    assertThat(s.tip()).contains("agreed");
  }

  @Test
  void exaggerationAndCallbackScoreHigher() {
    Score flat = BanterScorer.score(LINE, "oh that is lovely news", 2000, 10);
    Score good = BanterScorer.score(LINE, "Congrats, you now live in the cat's apartment for the next 18 years.", 4000, 10);
    assertThat(good.wit()).isGreaterThan(flat.wit());
    assertThat(good.surprise()).isGreaterThan(flat.surprise());
    assertThat(good.total()).isGreaterThanOrEqualTo(11);
    assertThat(good.spotted()).isEqualTo(BanterTechnique.EXAGGERATION);
  }

  @Test
  void meanRepliesLoseKindness() {
    Score s = BanterScorer.score(LINE, "you're so boring, nobody cares", 2000, 10);
    assertThat(s.kindness()).isEqualTo(1);
    assertThat(s.tip()).contains("teeth");
  }

  @Test
  void lateRepliesAreFlaggedAndCoached() {
    Score s = BanterScorer.score(LINE, "Honestly I love that, but the cat adopted you", 20_000, 5);
    assertThat(s.timedOut()).isTrue();
    assertThat(s.tip()).contains("moment had passed");
  }

  @Test
  void roleplayIsSpotted() {
    assertThat(BanterScorer.score(LINE, "*as the cat* Your sofa is mine now.", 2000, 10).spotted())
        .isEqualTo(BanterTechnique.ROLE_PLAY);
  }
}
