package app.punchline.workshop;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

import app.punchline.workshop.arena.Elo;
import org.junit.jupiter.api.Test;

class EloTest {
  @Test
  void equalRatingsSplitTheK() {
    assertThat(Elo.expected(1200, 1200)).isEqualTo(0.5);
    assertThat(Elo.delta(1200, 1200)).isEqualTo(16.0);
  }

  @Test
  void expectationsAreComplementaryAndMonotonic() {
    assertThat(Elo.expected(1400, 1200) + Elo.expected(1200, 1400)).isCloseTo(1.0, within(1e-12));
    // 400 points = 10:1 odds
    assertThat(Elo.expected(1600, 1200)).isCloseTo(10.0 / 11.0, within(1e-12));
    assertThat(Elo.expected(1300, 1200)).isGreaterThan(Elo.expected(1250, 1200));
  }

  @Test
  void upsetsMoveMorePointsThanExpectedWins() {
    double favouriteWins = Elo.delta(1400, 1200);
    double underdogWins = Elo.delta(1200, 1400);
    assertThat(underdogWins).isGreaterThan(16).isLessThan(Elo.K);
    assertThat(favouriteWins).isLessThan(16).isGreaterThan(0);
    assertThat(favouriteWins + underdogWins).isCloseTo(Elo.K, within(1e-9));
  }
}
