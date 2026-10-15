package app.jokesmith.workshop.arena;

/** Classic Elo: every joke starts at 1200; a duel moves K * (1 - expected) points to the winner. */
public final class Elo {
  public static final double START = 1200;
  public static final double K = 32;

  private Elo() {}

  /** Probability that a joke rated {@code ra} beats one rated {@code rb}. */
  public static double expected(double ra, double rb) {
    return 1.0 / (1.0 + Math.pow(10, (rb - ra) / 400.0));
  }

  /** Points the winner takes from the loser (zero-sum). An upset moves more points. */
  public static double delta(double winner, double loser) {
    return K * (1.0 - expected(winner, loser));
  }
}
