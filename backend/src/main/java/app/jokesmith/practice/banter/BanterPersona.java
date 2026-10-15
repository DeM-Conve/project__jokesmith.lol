package app.jokesmith.practice.banter;

/** Who the simulator plays. Constant name = Postgres {@code banter_persona} label. */
public enum BanterPersona {
  FRIEND("Friend", "Your mate on the sofa. Teasing allowed, sincerity optional."),
  COWORKER("Coworker", "Kitchen-at-work small talk. Be quick, stay employable."),
  DATE("Date", "Second-date chat. Charming beats clever; clever and kind beats both.");

  public final String label;
  public final String description;

  BanterPersona(String label, String description) {
    this.label = label;
    this.description = description;
  }
}
