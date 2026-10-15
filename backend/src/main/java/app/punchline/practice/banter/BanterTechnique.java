package app.punchline.practice.banter;

/** The move an example reply demonstrates. Constant name = Postgres {@code banter_technique} label. */
public enum BanterTechnique {
  EXAGGERATION("Exaggeration", "Blow the detail up to a ridiculous size."),
  MISDIRECTION("Misdirection", "Start down the expected road, then swerve."),
  LITERAL("Literal", "Take the figure of speech at face value."),
  REVERSAL("Reversal", "Flip the expected stance: love what they hate, dread what they love."),
  UNDERSTATEMENT("Understatement", "Treat something big as tiny and calm."),
  CALLBACK("Callback", "Reuse a word or detail they just said, with a twist."),
  SELF_DEPRECATION("Self-deprecation", "Make yourself the target. Always kind, often the safest laugh."),
  ESCALATION("Escalation", "\"Yes, and\": accept their premise and take it one step further."),
  ROLE_PLAY("Role-play", "Slip into a character or voice for a second.");

  public final String label;
  public final String description;

  BanterTechnique(String label, String description) {
    this.label = label;
    this.description = description;
  }
}
