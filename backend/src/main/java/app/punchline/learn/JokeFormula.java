package app.punchline.learn;

/** Joke-writing formulas. Constant name = Postgres {@code learn_joke_formula} label. */
public enum JokeFormula {
  MISDIRECTION("Misdirection"),
  RULE_OF_THREE("Rule of three"),
  EXAGGERATION("Exaggeration"),
  COMPARISON("Comparison"),
  LITERAL("Literal interpretation"),
  WORDPLAY("Wordplay"),
  REVERSAL("Reversal"),
  MASHUP("Mash-up"),
  ATTITUDE("Attitude"),
  CALLBACK("Callback"),
  OTHER("Something else");

  private final String label;

  JokeFormula(String label) {
    this.label = label;
  }

  public String label() {
    return label;
  }
}
