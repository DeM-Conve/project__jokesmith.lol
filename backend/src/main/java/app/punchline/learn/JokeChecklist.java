package app.punchline.learn;

import app.punchline.learn.LearnDtos.Check;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import org.springframework.stereotype.Component;

/**
 * The rule-based coach: a checklist of craft rules (punch word last, economy,
 * a real turn, the formula's signature move) with a concrete tip for every miss.
 */
@Component
public class JokeChecklist {
  static final int MAX_WORDS = 45;
  private static final java.util.regex.Pattern VAGUE = java.util.regex.Pattern.compile(
      "\\b(?:forever|ages|so so|really really|very very|a lot|loads|tons|super|insanely|crazy|totally|extremely)\\b",
      java.util.regex.Pattern.CASE_INSENSITIVE);
  private static final Set<String> VAGUE_ENDINGS = Set.of(
      "long", "big", "old", "late", "bad", "much", "lot", "ages", "forever", "slow", "small", "expensive", "annoying");
  static final int MAX_PUNCH_WORDS = 15;

  /**
   * @param formula the formula the joke is meant to use, or null for craft checks only
   * @param premise the premise text it should stay on, or null
   */
  public List<Check> check(JokeFormula formula, String premise, String setupIn, String punchIn) {
    return check(formula, premise, List.of(), setupIn, punchIn);
  }

  /** @param keywords extra curated words that count as staying on the premise */
  public List<Check> check(JokeFormula formula, String premise, List<String> keywords, String setupIn, String punchIn) {
    String setup = JokeText.clean(setupIn);
    String punch = JokeText.clean(punchIn);
    if (setup.isBlank()) {
      JokeText.Split s = JokeText.split(punch);
      setup = s.setup();
      punch = s.punchline();
    }
    String all = (setup + " " + punch).strip();
    List<Check> checks = new ArrayList<>();
    int setupWords = JokeText.wordCount(setup);
    int punchWords = JokeText.wordCount(punch);
    int total = setupWords + punchWords;

    checks.add(new Check("setup", "The setup builds an assumption", setupWords >= 3,
        "Give the audience something to believe first. A few words of normal-sounding setup, then the turn."));

    String pw = JokeText.punchWord(punch);
    boolean last = JokeText.punchWordLast(punch);
    checks.add(new Check("punch-last", "The punch word is the last word", last,
        last ? "Ends on \"" + pw + "\". Good."
            : "Move \"" + pw + "\" to the very end. Cut or reorder \"" + String.join(" ", JokeText.trailing(punch))
                + "\". The laugh starts the moment the surprise word lands, so nothing should come after it."));

    checks.add(new Check("punch-short", "The punchline is tight (" + MAX_PUNCH_WORDS + " words or fewer)",
        punchWords <= MAX_PUNCH_WORDS,
        "Your punch is " + punchWords + " words. Move the information into the setup so the punch is only the turn."));

    checks.add(new Check("economy", "The whole joke is lean (" + MAX_WORDS + " words or fewer)", total <= MAX_WORDS,
        "At " + total + " words it's a story, not a joke. Cut adjectives, names and \"so basically\" until it breaks, then put one back."));

    boolean explains = FormulaCues.EXPLAINING.matcher(punch).find();
    checks.add(new Check("no-explaining", "No explaining the joke", !explains,
        "Cut \"because…\", \"get it\", \"lol\" and emoji from the punch. If the joke needs explaining, fix the setup instead."));

    Set<String> setupStems = JokeText.contentStems(setup);
    if (premise != null) setupStems.addAll(JokeText.contentStems(premise));
    boolean newImage = JokeText.contentStems(punch).stream().anyMatch(s -> !setupStems.contains(s));
    checks.add(new Check("turn", "The punch brings something new", newImage,
        "The punch only repeats what the setup said. Introduce a new image, person or word that changes the picture."));

    if (premise != null && !premise.isBlank()) {
      Set<String> premiseStems = JokeText.contentStems(premise);
      for (String k : keywords) premiseStems.addAll(JokeText.contentStems(k));
      String flatAll = " " + JokeText.flat(all) + " ";
      boolean on = JokeText.contentStems(all).stream().anyMatch(premiseStems::contains)
          || keywords.stream().anyMatch(k -> flatAll.contains(" " + JokeText.flat(k) + " "));
      checks.add(new Check("on-premise", "It stays on the premise", on,
          "I can't find the premise's words in your joke. Name the topic so the audience knows what we're talking about."));
    }

    if (formula != null) checks.addAll(formulaChecks(formula, setup, punch, all));
    return checks;
  }

  private List<Check> formulaChecks(JokeFormula f, String setup, String punch, String all) {
    List<Check> out = new ArrayList<>();
    String echo = JokeText.echo(setup, punch);
    switch (f) {
      case RULE_OF_THREE -> {
        Matcher m = FormulaCues.THREE_LIST.matcher(all);
        boolean found = m.find();
        out.add(new Check("three-items", "There's a list of three", found,
            "Write it as \"A, B and C\": two normal items that set a pattern, then a third that breaks it."));
        // The odd item must start near the end: at most a short tail after its first word.
        boolean thirdLast = found && JokeText.wordCount(all.substring(m.start(3))) <= 8;
        out.add(new Check("third-last", "The odd one out comes last", thirdLast,
            "Put the surprising item third and end the joke on it. Not first, not in the middle."));
      }
      case EXAGGERATION -> {
        boolean num = FormulaCues.NUMBER.matcher(all).find();
        boolean ext = FormulaCues.EXTREME.matcher(all).find();
        out.add(new Check("inflated", "It inflates something past reality", num || ext,
            "Push it further. Go from \"really long\" to \"long enough that the milk expired twice\"."));
        String pw = JokeText.norm(JokeText.punchWord(punch));
        boolean vague = VAGUE.matcher(punch).find() || VAGUE_ENDINGS.contains(pw);
        out.add(new Check("specific-size", "The size is a picture, not just \"really X\"",
            num || FormulaCues.COMPARISON.matcher(all).find() || !vague,
            "\"Forever\" and \"so so long\" are vague. Show the consequence: a number or an image, like \"big enough to have its own postcode\"."));
      }
      case COMPARISON -> out.add(new Check("compare", "There's a comparison (like / as … as / than / basically)",
          FormulaCues.COMPARISON.matcher(all).find(),
          "Link it to something from a different world: \"X is like Y\", \"X is basically Y\", \"more A than B\"."));
      case LITERAL -> {
        out.add(new Check("phrase", "The setup has a phrase that can be taken word for word",
            FormulaCues.LITERAL.matcher(setup).find() || echo != null,
            "Start from an idiom, an instruction or a sign (\"break a leg\", \"keep an eye on it\") and quote it in the setup."));
        out.add(new Check("echo", "The punch acts on that phrase literally", echo != null,
            "Bring a word from the phrase back in the punch, doing exactly what it says."));
      }
      case WORDPLAY -> out.add(new Check("double", "A word or sound does double duty", echo != null || soundAlike(setup, punch),
          "Pick one word with two meanings (or a sound-alike). The setup uses meaning one, and the punch flips to meaning two."));
      case REVERSAL -> out.add(new Check("flip", "The punch flips direction (but / turns out / actually / it was me)",
          FormulaCues.REVERSAL.matcher(punch).find() || echo != null,
          "Set up the normal direction, then flip roles: the victim is the culprit, the teacher learns, the pet owns you."));
      case MASHUP -> out.add(new Check("two-worlds", "Two worlds collide (if X were Y / X meets Y / like a …)",
          FormulaCues.MASHUP.matcher(all).find() || FormulaCues.COMPARISON.matcher(all).find(),
          "Name the second world outright: \"if my cat ran HR\", \"a wedding, but it's a hostage negotiation\"."));
      case ATTITUDE -> out.add(new Check("attitude", "The setup states an attitude (weird / stupid / scary / hard)",
          FormulaCues.ATTITUDE.matcher(setup.isBlank() ? all : setup).find(),
          "Open with how you feel: \"You know what's weird about…\", \"The scariest thing about…\". Then prove it."));
      case MISDIRECTION -> out.add(new Check("room", "The setup is longer than the punch",
          JokeText.wordCount(setup) > JokeText.wordCount(punch),
          "Misdirection needs room to steer. Spend more words on an innocent setup, then turn it in a few."));
      default -> { }
    }
    return out;
  }

  /** Two different words that start with the same three letters (a rough pun detector). */
  private static boolean soundAlike(String setup, String punch) {
    for (String a : JokeText.contentStems(setup)) {
      for (String b : JokeText.contentStems(punch)) {
        if (!a.equals(b) && a.length() >= 4 && b.length() >= 4 && a.substring(0, 3).equals(b.substring(0, 3))) return true;
      }
    }
    return false;
  }
}
