package app.jokesmith.workshop.punchup;

/** The economy/formula fixes the coach knows. Each flag and each curated example carries one. */
public enum PunchFix {
  SPLIT_SETUP("Split setup from punchline"),
  CUT_FILLER("Cut the filler"),
  END_ON_PUNCH("End on a strong word"),
  MOVE_PUNCH_LAST("Move the punch word last"),
  HIDE_THE_TWIST("Don't tip the twist"),
  TRIM_SETUP("Trim the setup"),
  SHORTEN_PUNCH("Shorten the punchline"),
  GET_SPECIFIC("Get specific"),
  RULE_OF_THREE("Use the rule of three");

  private final String label;

  PunchFix(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
