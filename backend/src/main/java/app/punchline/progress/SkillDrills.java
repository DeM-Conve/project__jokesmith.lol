package app.punchline.progress;

import app.punchline.core.ComedySkill;
import java.util.EnumMap;
import java.util.Map;

/** Where each skill is trained, and how the Today plan pitches it. */
final class SkillDrills {
  private SkillDrills() {}

  record Drill(String route, String title, String why) {}

  static final Map<ComedySkill, Drill> DRILLS = new EnumMap<>(ComedySkill.class);

  static {
    DRILLS.put(ComedySkill.ANATOMY, new Drill("/xray", "X-ray a joke",
        "Take a joke apart: find the setup, the assumption, and the reveal that flips it."));
    DRILLS.put(ComedySkill.ASSOCIATION, new Drill("/associate", "Map an association web",
        "Funny lives in the connections. Ten links from one topic, then hunt for the collision."));
    DRILLS.put(ComedySkill.FORMULAS, new Drill("/gym", "Formula Gym set",
        "Reps on proven shapes (rule of three, misdirection, reversal) until they're reflexes."));
    DRILLS.put(ComedySkill.POINT_OF_VIEW, new Drill("/learn/POINT_OF_VIEW", "Find your point of view",
        "A joke is an opinion with a twist. Practise having strong, specific takes."));
    DRILLS.put(ComedySkill.ECONOMY, new Drill("/punchup", "Punch up a joke",
        "Cut every word that isn't pulling weight. Shorter setups hit harder."));
    DRILLS.put(ComedySkill.HEIGHTENING, new Drill("/riff", "Heighten a premise",
        "Take one funny idea and push it: bigger, weirder, more specific, three times."));
    DRILLS.put(ComedySkill.REAL_TIME_WIT, new Drill("/banter", "Timed banter round",
        "Answer fast, out loud, no editing. Quick wit is a muscle, not a gift."));
    DRILLS.put(ComedySkill.DELIVERY, new Drill("/delivery", "Step up to the mic",
        "Say a joke out loud and land the pause before the punch."));
    DRILLS.put(ComedySkill.FEEDBACK, new Drill("/arena", "Judge in the Arena",
        "Vote on head-to-head jokes. Knowing why one wins trains your own ear."));
  }

  /** Display names, curriculum order = enum order. */
  static String label(ComedySkill s) {
    return switch (s) {
      case ANATOMY -> "Joke anatomy";
      case ASSOCIATION -> "Association";
      case FORMULAS -> "Formulas";
      case POINT_OF_VIEW -> "Point of view";
      case ECONOMY -> "Economy";
      case HEIGHTENING -> "Heightening";
      case REAL_TIME_WIT -> "Real-time wit";
      case DELIVERY -> "Delivery";
      case FEEDBACK -> "Feedback";
    };
  }
}
