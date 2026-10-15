package app.jokesmith.practice.association;

/** Brainstorm columns. Constant name = Postgres {@code association_category} label. */
public enum AssociationCategory {
  PEOPLE("People", "Who's there? Roles, types, that one guy."),
  PLACES("Places", "Where does it happen? What does it remind you of?"),
  THINGS("Things", "Objects, sounds, smells, the stuff on the table."),
  PHRASES("Phrases", "Clichés, things people say, signs on the wall."),
  FEELINGS("Feelings", "How it feels, physically and emotionally.");

  public final String label;
  public final String hint;

  AssociationCategory(String label, String hint) {
    this.label = label;
    this.hint = hint;
  }
}
