package app.jokesmith.workshop.punchup;

/** Where a punch-up session is (Postgres {@code workshop_punchup_stage}). */
public enum PunchUpStage {
  /** Stage 1: the coach has asked its questions; waiting for the user's rewrite. */
  DIAGNOSED,
  /** Stage 2+: at least one rewrite has been critiqued; rewrite moves are unlocked. */
  REWRITTEN
}
