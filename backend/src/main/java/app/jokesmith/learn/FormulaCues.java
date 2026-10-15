package app.jokesmith.learn;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Spots the surface signals each formula tends to leave in the text. A cue is
 * evidence, not proof: the X-ray says so, and the checklist uses them as nudges.
 */
final class FormulaCues {
  private FormulaCues() {}

  private static final String W = "[\\p{L}\\p{N}'’-]+";
  private static final String ITEM = W + "(?:\\s+" + W + "){0,4}";

  static final Pattern THREE_LIST = Pattern.compile(
      "(" + ITEM + "),\\s+(" + ITEM + "),?\\s+(?:and|or|plus)\\s+(" + ITEM + ")", Pattern.CASE_INSENSITIVE);
  static final Pattern COMPARISON = Pattern.compile(
      "(?<!\\b(?:i|you|we|they|would|to|do|don't|really|she|he|i'd|you'd)\\s)\\blike\\s+(?:a|an|the|my|your|his|her|someone|somebody|being|trying|watching|when|if|it's|they're|you're|\\w+ing)\\b"
          + "|\\bas\\s+\\w+\\s+as\\b|\\b(?:more|less|worse|better)\\s+\\w*\\s*than\\b|\\b\\w+er\\s+than\\b"
          + "|\\bbasically\\s+(?:a|an|just)\\b|\\bthe\\s+\\w+\\s+of\\s+(?:\\w+\\s+)?\\w+s\\b|\\bequivalent of\\b"
          + "|\\bis just\\s+(?:a|an)\\b|\\bsame energy as\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern NUMBER = Pattern.compile(
      "\\b\\d[\\d,.]*\\b|\\b(?:hundred|hundreds|thousand|thousands|million|millions|billion|trillion|dozen|forty|fifty|sixty|seventy|eighty|ninety)\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern EXTREME = Pattern.compile(
      "\\bso\\s+\\w+(?:\\s+\\w+){0,2},?\\s+(?:that|i|i've|i'm|my|the|it|its|it's|even|they|you|he|she|we|our)\\b|\\bevery single\\b|\\bentire\\b|\\bthe whole\\b|\\bnever once\\b"
          + "|\\bforever\\b|\\bcenturies\\b|\\bdecades\\b|\\bthe size of\\b|\\bthe most\\b|\\bthe only\\b|\\bat least\\b|\\bstill\\b"
          + "|\\bnasa\\b|\\bscientists\\b|\\bgeologically\\b|\\bvisible from\\b|\\bspace\\b|\\buniverse\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern REVERSAL = Pattern.compile(
      "^(?:but|except|turns out|actually|instead|unless|until|then|now|so now|and now|apparently)\\b|\\bturns out\\b|\\bthe other way\\b|\\bwas me\\b|\\bit's me\\b|\\bfor me\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern LITERAL = Pattern.compile(
      "\\btold me to\\b|\\bsaid to\\b|\\basked me to\\b|\\bsays to\\b|\\bsaid i should\\b|\\bsuggested\\b|\\brecommended\\b|\\badvice\\b"
          + "|\\binstructions\\b|\\bsign (?:said|says)\\b|\\bthe label\\b|\\bthey say\\b|\\bsupposed to\\b|\\bcalled\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern MASHUP = Pattern.compile(
      "\\bif\\s+(?:\\w+\\s+){1,4}(?:were|was|had|ran|run|runs|wrote|could)\\b|\\bimagine\\b|\\bmeets\\b|\\bbut for\\b|\\bversion of\\b|\\bwritten by\\b"
          + "|\\bdirected by\\b|\\bas a\\s+(?:\\w+\\s+)?(?:show|movie|sport|restaurant|religion|airline|startup|reality)\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern ATTITUDE = Pattern.compile(
      "\\b(?:weird|stupid|scary|scariest|hard|hardest|hate|annoying|terrifying|terrified|insane|ridiculous|the worst|can't stand|nobody tells you"
          + "|why do|why does|why is|ever notice|you know what|what's the deal|i don't understand|it's weird|it's stupid|it's scary|it's hard)\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern ATTITUDE_DECLARED = Pattern.compile(
      "\\b(?:is|are|it's|that's|was|being)\\s+(?:so\\s+|really\\s+|just\\s+)?(?:weird|stupid|scary|hard|annoying|ridiculous|terrifying)\\b"
          + "|\\b(?:scariest|weirdest|stupidest|hardest)\\b|\\bwhat's (?:weird|stupid|scary|hard)\\b",
      Pattern.CASE_INSENSITIVE);
  static final Pattern EXPLAINING = Pattern.compile(
      "\\bbecause\\b|\\bget it\\b|\\blol\\b|\\bhaha\\b|\\blmao\\b|\\bas in\\b|\\bwhich means\\b|\\bi mean\\b|\\bthe joke is\\b|😂|🤣",
      Pattern.CASE_INSENSITIVE);

  record Evidence(Map<JokeFormula, Double> scores, List<String> cues, String thirdItem) {}

  static Evidence read(String setup, String punch) {
    String all = (setup + " " + punch).strip();
    Map<JokeFormula, Double> score = new EnumMap<>(JokeFormula.class);
    List<String> cues = new ArrayList<>();
    String third = null;

    Matcher list = THREE_LIST.matcher(all);
    if (list.find()) {
      third = list.group(3);
      score.merge(JokeFormula.RULE_OF_THREE, 3.0, Double::sum);
      cues.add("A list of three: \"" + list.group(1) + ", " + list.group(2) + " … " + third + "\"");
    }
    Matcher cmp = COMPARISON.matcher(all);
    if (cmp.find()) {
      score.merge(JokeFormula.COMPARISON, 2.5, Double::sum);
      cues.add("A comparison signal: \"" + cmp.group().strip() + "\"");
    }
    Matcher num = NUMBER.matcher(all);
    if (num.find()) {
      score.merge(JokeFormula.EXAGGERATION, 1.5, Double::sum);
      cues.add("A specific number: \"" + num.group() + "\"");
    }
    Matcher ext = EXTREME.matcher(all);
    if (ext.find()) {
      score.merge(JokeFormula.EXAGGERATION, 1.5, Double::sum);
      cues.add("An intensifier: \"" + ext.group().strip() + "\"");
    }
    Matcher rev = REVERSAL.matcher(punch.strip());
    if (rev.find()) {
      score.merge(JokeFormula.REVERSAL, 2.0, Double::sum);
      cues.add("The punch turns on \"" + rev.group().strip() + "\"");
    }
    Matcher lit = LITERAL.matcher(setup);
    if (lit.find()) {
      score.merge(JokeFormula.LITERAL, 2.0, Double::sum);
      cues.add("The setup quotes an instruction or phrase (\"" + lit.group().strip() + "\") that can be taken word for word");
    }
    Matcher mash = MASHUP.matcher(all);
    if (mash.find()) {
      score.merge(JokeFormula.MASHUP, 2.5, Double::sum);
      cues.add("Two worlds collide: \"" + mash.group().strip() + "\"");
    }
    Matcher att = ATTITUDE.matcher(setup.isBlank() ? all : setup);
    if (att.find()) {
      // A declared attitude ("X is weird", "the scariest thing") frames the whole joke.
      boolean declared = ATTITUDE_DECLARED.matcher(setup.isBlank() ? all : setup).find();
      score.merge(JokeFormula.ATTITUDE, declared ? 3.0 : 2.0, Double::sum);
      cues.add("An attitude word: \"" + att.group().strip() + "\"");
    }
    String echo = JokeText.echo(setup, punch);
    if (echo != null) {
      score.merge(JokeFormula.WORDPLAY, 1.25, Double::sum);
      score.merge(JokeFormula.LITERAL, 0.75, Double::sum);
      cues.add("\"" + echo + "\" appears in the setup and comes back in the punch with a new job");
    }
    if (!setup.isBlank()) score.merge(JokeFormula.MISDIRECTION, 1.0, Double::sum);
    return new Evidence(score, cues, third);
  }

  /** The highest-scoring formula; ties go to the earlier (more common) formula. */
  static JokeFormula best(Evidence e) {
    JokeFormula best = JokeFormula.OTHER;
    double top = 0;
    for (JokeFormula f : JokeFormula.values()) {
      double s = e.scores().getOrDefault(f, 0.0);
      if (s > top) {
        top = s;
        best = f;
      }
    }
    return best;
  }
}
