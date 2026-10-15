package app.punchline.learn;

import app.punchline.learn.FormulaCues.Evidence;
import app.punchline.learn.LearnDtos.XRay;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * The offline joke X-ray: splits setup and punch at the last sentence boundary,
 * takes the punch word as the last content word, and names a formula from the
 * cues it finds. Its output is honestly labelled as an estimate.
 */
@Component
public class XRayAnalyzer {

  private static final Map<JokeFormula, String> WHY = Map.ofEntries(
      Map.entry(JokeFormula.MISDIRECTION,
          "The setup lets you build the most ordinary picture of what's going on. The punch keeps every fact true but swaps the picture. That jolt, \"oh, it was THAT story\", is the laugh."),
      Map.entry(JokeFormula.RULE_OF_THREE,
          "Two items make a pattern and the third breaks it. Two is the shortest pattern a brain can spot, and three is the fastest way to break one."),
      Map.entry(JokeFormula.EXAGGERATION,
          "It takes a real feeling and inflates it past what's possible, but in a specific, picturable way. The audience laughs at the size of it and nods at the truth underneath."),
      Map.entry(JokeFormula.COMPARISON,
          "It links two things that share exactly one surprising quality. The further apart they are, the bigger the jolt, as long as the shared quality is instantly obvious."),
      Map.entry(JokeFormula.LITERAL,
          "The setup uses a phrase everyone reads as a figure of speech. The punch takes it word for word, so the phrase turns out to have been ambiguous all along."),
      Map.entry(JokeFormula.WORDPLAY,
          "One word or sound does two jobs. The setup primes the first meaning and the punch cashes in the second, and the audience's brain has to switch tracks in a split second."),
      Map.entry(JokeFormula.REVERSAL,
          "It sets up the normal direction of a situation and then flips it: who's doing what to whom, cause and effect, or the expected roles."),
      Map.entry(JokeFormula.MASHUP,
          "It looks at one world through the rules of another. The comedy comes from the specific details that suddenly fit where they shouldn't."),
      Map.entry(JokeFormula.ATTITUDE,
          "There's a clear emotion behind it (weird, stupid, scary or hard). The attitude gives the audience a point of view to agree with, and the punch shows why it's justified."),
      Map.entry(JokeFormula.CALLBACK,
          "It brings back something from earlier in a new context. The audience is rewarded for remembering, and the old line picks up a new meaning."),
      Map.entry(JokeFormula.OTHER,
          "No textbook pattern stood out. It may run on character, tone or a very specific observation. Try marking the setup, assumption and punch word yourself to find the mechanism."));

  public XRay analyse(String text) {
    JokeText.Split split = JokeText.split(text);
    String setup = split.setup();
    String punch = split.punchline();
    Evidence ev = FormulaCues.read(setup, punch);
    JokeFormula formula = FormulaCues.best(ev);

    List<JokeFormula> also = new ArrayList<>();
    ev.scores().entrySet().stream()
        .filter(e -> e.getKey() != formula && e.getKey() != JokeFormula.MISDIRECTION && e.getValue() >= 1.5)
        .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
        .forEach(e -> also.add(e.getKey()));

    String punchWord = JokeText.punchWord(punch);
    boolean last = JokeText.punchWordLast(punch);
    String echo = JokeText.echo(setup, punch);
    String connector = echo != null ? echo : JokeText.lastContent(setup);
    if (connector.isBlank()) connector = punchWord;
    String setupTail = JokeText.clip(setup.isBlank() ? punch : setup, 12);
    String punchShort = JokeText.clip(punch, 12);

    String assumption;
    String reinterpretation;
    switch (formula) {
      case RULE_OF_THREE -> {
        assumption = "The first two items set a pattern, so you expect the third to be more of the same.";
        reinterpretation = "The third item" + (ev.thirdItem() != null ? " (\"" + ev.thirdItem() + "\")" : "")
            + " breaks the pattern and recasts the whole list.";
      }
      case COMPARISON -> {
        assumption = "You expect the thing being described to be compared to something neutral or flattering.";
        reinterpretation = "The comparison picks a picture from a completely different world that shares one embarrassingly accurate quality.";
      }
      case EXAGGERATION -> {
        assumption = "You expect a real-world amount: a normal degree of \"" + connector + "\".";
        reinterpretation = "The punch inflates it far past reality, and the specific, picturable size is what makes it land.";
      }
      case LITERAL -> {
        assumption = "You read \"" + connector + "\" the way everyone means it: as a figure of speech or a normal instruction.";
        reinterpretation = "The punch takes \"" + connector + "\" word for word, so the instruction was followed perfectly and wrongly.";
      }
      case WORDPLAY -> {
        assumption = "You take \"" + connector + "\" in its first, obvious meaning.";
        reinterpretation = "The punch switches \"" + connector + "\" to its other meaning (or a word that sounds like it).";
      }
      case REVERSAL -> {
        assumption = "You assume the situation runs in its normal direction: the usual roles, the usual cause and effect.";
        reinterpretation = "\"" + punchShort + "\" flips it, and the person or thing you trusted turns out to be the problem.";
      }
      case MASHUP -> {
        assumption = "You file the subject under its own world, with its own normal rules.";
        reinterpretation = "The punch runs it by the rules of a different world, and its details fit too well.";
      }
      case ATTITUDE -> {
        assumption = "You expect a neutral observation about \"" + connector + "\".";
        reinterpretation = "The punch shows why the attitude is earned: the specific detail that makes it truly weird, stupid, scary or hard.";
      }
      default -> {
        assumption = "The setup (\"" + setupTail + "\") steers you to the most ordinary reading of \"" + connector + "\".";
        reinterpretation = "\"" + punchShort + "\" reveals a second story that fits the same facts but wasn't the one you pictured.";
      }
    }

    List<String> tips = new ArrayList<>();
    int words = JokeText.wordCount(text);
    if (!last) {
      tips.add("The punch word \"" + punchWord + "\" isn't last. Try cutting \"" + String.join(" ", JokeText.trailing(punch))
          + "\" so the surprise is the final thing heard.");
    }
    if (words > 45) tips.add("At " + words + " words this is long for a single joke. Every word before the punch is a tax on the laugh.");
    if (FormulaCues.EXPLAINING.matcher(punch).find()) tips.add("The punch seems to explain itself. Trust the audience and cut the explanation.");
    if (setup.isBlank()) tips.add("I couldn't find a clear setup. A joke needs something to break, so give the audience an assumption first.");

    String why = WHY.get(formula) + (last
        ? " The punch word \"" + punchWord + "\" sits at the very end, so the surprise and the silence after it arrive together."
        : " Note that the punch word \"" + punchWord + "\" isn't the last word, which softens the hit.");

    boolean strong = ev.scores().getOrDefault(formula, 0.0) >= 2.0;
    String confidence = strong && last && !setup.isBlank() ? "medium" : "low";

    return new XRay(setup, punch, assumption, connector, reinterpretation, punchWord, last, formula, formula.label(),
        also, why, ev.cues(), tips, words, "ESTIMATE", confidence);
  }
}
