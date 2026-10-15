package app.punchline.workshop.punchup;

import static app.punchline.workshop.WorkshopText.*;

import app.punchline.workshop.WorkshopText.Token;
import app.punchline.workshop.punchup.PunchUpExamples.Example;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * The rule-based punch-up coach. Measures a joke (word counts, filler, where the punch word
 * sits, generic nouns, lists) and turns each finding into a specific flag with a Socratic
 * question and a curated before/after example of the same fix.
 */
@Component
public class PunchUpAnalyser {
  static final int SETUP_TARGET = 15;
  static final int PUNCH_TARGET = 15;

  public enum Severity { HIGH, MEDIUM, LOW }

  public enum DiffOp { SAME, ADDED, REMOVED }

  public record Metrics(int words, int setupWords, int punchWords, List<String> fillers, int fillerWords,
      String punchWord, int wordsAfterPunch, String lastWord, boolean weakEnding, List<String> genericNouns,
      int listItems, int cutTarget, int score) {}

  public record Flag(PunchFix fix, String label, Severity severity, String finding, String question,
      List<String> words, Example example) {}

  public record Analysis(Metrics metrics, List<Flag> flags, List<String> strengths) {
    public Set<PunchFix> fixes() {
      return flags.stream().map(Flag::fix).collect(Collectors.toCollection(LinkedHashSet::new));
    }
  }

  public record Move(PunchFix fix, String label, String instruction, List<String> words, Example example) {}

  public record DiffToken(String text, DiffOp op) {}

  public record Critique(int wordsBefore, int wordsAfter, String punchWordBefore, int afterPunchBefore,
      String punchWordAfter, int afterPunchAfter, int scoreBefore, int scoreAfter, List<String> fillersCut,
      List<PunchFix> fixed, List<PunchFix> remaining, List<PunchFix> introduced, List<String> notes,
      String verdict, List<DiffToken> diff) {}

  private final PunchUpExamples examples;

  public PunchUpAnalyser(PunchUpExamples examples) {
    this.examples = examples;
  }

  // ------------------------------------------------------------------ analysis

  public Analysis analyse(String setupIn, String punchIn) {
    String setup = setupIn == null ? "" : setupIn.strip();
    String punch = punchIn == null ? "" : punchIn.strip();
    List<Token> st = tokens(setup);
    List<Token> pt = tokens(punch);
    List<String> all = new ArrayList<>();
    st.forEach(t -> all.add(t.lower()));
    pt.forEach(t -> all.add(t.lower()));
    int seed = (setup + "|" + punch).toLowerCase(Locale.ROOT).hashCode();

    List<String> fillers = findFillers(all);
    int fillerWords = fillers.stream().mapToInt(f -> f.split(" ").length).sum();
    Token punchTok = punchWord(st, pt);
    int afterPunch = punchTok == null ? 0 : pt.size() - 1 - punchTok.index();
    Token last = pt.isEmpty() ? null : pt.get(pt.size() - 1);
    boolean weakEnding = last != null && (WEAK_ENDINGS.contains(last.lower()) || endsWithFillerPhrase(pt));
    Token lastContent = lastContent(pt);
    List<String> generic = all.stream().filter(GENERIC_NOUNS::contains).distinct().toList();
    int listItems = listItems(setup + " " + punch);
    int cutTarget = fillerWords + Math.max(0, st.size() - SETUP_TARGET) + Math.max(0, pt.size() - PUNCH_TARGET);

    List<Flag> flags = new ArrayList<>();
    List<String> strengths = new ArrayList<>();

    // 1. One long line: no setup/punch split.
    if (setup.isEmpty() && pt.size() >= 8) {
      String splitAt = all.stream().filter(w -> Set.of("because", "since", "but", "so", "until").contains(w))
          .findFirst().orElse(null);
      String finding = "It's all one line (" + pt.size() + " words). A joke has two halves: the expectation, "
          + "then the turn." + (splitAt == null ? "" : " '" + splitAt + "' looks like the hinge, and it's also explaining the joke.");
      flags.add(flag(PunchFix.SPLIT_SETUP, Severity.HIGH, finding,
          "Where does the surprise start? Everything before that moment is setup.",
          splitAt == null ? List.of() : List.of(splitAt), seed));
    }

    // 2. Filler and hedges.
    if (!fillers.isEmpty()) {
      flags.add(flag(PunchFix.CUT_FILLER, fillerWords >= 3 ? Severity.HIGH : Severity.MEDIUM,
          fillerWords + " filler word" + (fillerWords == 1 ? "" : "s") + ": " + quoteList(distinct(fillers))
              + ". They stall the rhythm and make you sound unsure the joke is worth telling.",
          "Read it aloud without " + (fillers.size() == 1 ? "it" : "them") + ". Did you lose anything at all?",
          distinct(fillers), seed));
    }

    // 3. Weak last word: the laugh lands on the last word.
    if (weakEnding) {
      List<String> tail = lastContent == null ? List.of(last.text())
          : pt.subList(lastContent.index() + 1, pt.size()).stream().map(Token::text).toList();
      String finding = "It ends on '" + last.text() + "'. The last word is where the laugh lands, and '"
          + last.text() + "' can't carry it.";
      if (lastContent != null && !tail.isEmpty()) {
        finding += " Your last strong word is '" + lastContent.text() + "', with " + tail.size() + " word"
            + (tail.size() == 1 ? "" : "s") + " after it (" + String.join(" ", tail) + ").";
      }
      flags.add(flag(PunchFix.END_ON_PUNCH, Severity.HIGH, finding,
          "What's the most surprising word in your punchline? Can the sentence end right there?", tail, seed));
    } else if (punchTok != null && afterPunch >= 4) {
      // 4. Strong-looking word buried mid-sentence.
      List<Token> tail = pt.subList(punchTok.index() + 1, pt.size());
      long tailContent = tail.stream().filter(t -> isContent(t.lower())).count();
      if (afterPunch >= 6 || tailContent * 2 < tail.size()) {
        flags.add(flag(PunchFix.MOVE_PUNCH_LAST, Severity.MEDIUM,
            "'" + punchTok.text() + "' looks like your surprise word, but it's buried " + afterPunch
                + " words from the end (\"..." + String.join(" ", tail.stream().map(Token::text).toList()) + "\").",
            "Is '" + punchTok.text() + "' the surprise? If so, how can the sentence end on it? If not, which word is?",
            List.of(punchTok.text()), seed));
      }
    }

    // 5. Setup gives the twist away.
    if (!st.isEmpty()) {
      List<Token> keyPunch = new ArrayList<>();
      if (punchTok != null) keyPunch.add(punchTok);
      if (lastContent != null && lastContent != punchTok) keyPunch.add(lastContent);
      outer:
      for (Token p : keyPunch) {
        if (p.lower().length() < 4) continue;
        for (Token s : st) {
          if (s.lower().length() >= 4 && isContent(s.lower()) && sameFamily(s.lower(), p.lower())) {
            flags.add(flag(PunchFix.HIDE_THE_TWIST, Severity.MEDIUM,
                "Your setup already says '" + s.text() + "', so '" + p.text() + "' in the punchline isn't news. "
                    + "The setup should point the audience the wrong way.",
                "After your setup, what does the audience assume? The punchline should break that assumption, not repeat it.",
                List.of(s.text()), seed));
            break outer;
          }
        }
      }
    }

    // 6. Setup too long.
    if (st.size() > SETUP_TARGET + 3) {
      int cut = st.size() - SETUP_TARGET;
      flags.add(flag(PunchFix.TRIM_SETUP, st.size() > SETUP_TARGET + 13 ? Severity.HIGH : Severity.MEDIUM,
          "Your setup is " + st.size() + " words. Most strong setups are under " + SETUP_TARGET
              + ", so cut about " + cut + ". The audience only needs what the punchline uses.",
          "Which facts does the punchline actually need? Keep those and cut the rest.", keepWords(st, pt), seed));
    }

    // 7. Punchline too long.
    if (pt.size() > PUNCH_TARGET + 1 || (!st.isEmpty() && pt.size() > 10 && pt.size() > 2 * st.size())) {
      flags.add(flag(PunchFix.SHORTEN_PUNCH, Severity.MEDIUM,
          "Your punchline is " + pt.size() + " words" + (st.isEmpty() ? "" : " (setup: " + st.size() + ")")
              + ". The turn should be quick. The longer it runs, the more the surprise leaks out.",
          "Can you say the twist in 8 words or fewer?", List.of(), seed));
    }

    // 8. Generic nouns.
    if (!generic.isEmpty()) {
      flags.add(flag(PunchFix.GET_SPECIFIC, generic.size() > 1 ? Severity.MEDIUM : Severity.LOW,
          quoteList(generic) + (generic.size() == 1 ? " is" : " are") + " generic, so the audience can't picture it. "
              + "Specific details are funnier: a brand, a name, a number.",
          "Which " + generic.get(0) + ", exactly? What would you see if you were there?", generic, seed));
    }

    // 9. Lists: three is the magic number.
    if (listItems >= 4) {
      flags.add(flag(PunchFix.RULE_OF_THREE, Severity.MEDIUM,
          "Your list has " + listItems + " items. Three is the magic number: two set a pattern, the third breaks it.",
          "Which two items are the most normal, and what's the one item that doesn't belong?", List.of(), seed));
    } else if (listItems == 2 || (setup.endsWith(":") && listItems < 3 && punch.contains(" and "))) {
      flags.add(flag(PunchFix.RULE_OF_THREE, Severity.LOW,
          "You've got a list of two. Two items are only a list; a third item that breaks the pattern makes it a joke.",
          "What's a third item that sounds like it belongs but absolutely doesn't?", List.of(), seed));
    }

    // Strengths: tell them what's already working.
    if (last != null && !weakEnding) strengths.add("Ends on a strong word: '" + last.text() + "'.");
    if (all.size() <= 20 && all.size() >= 4) strengths.add("Tight: " + all.size() + " words.");
    if (fillers.isEmpty() && !all.isEmpty()) strengths.add("No filler words.");
    if (listItems == 3) strengths.add("A list of three. Check that the third item is the odd one out.");
    List<String> specifics = java.util.stream.Stream.concat(st.stream(), pt.stream())
        .filter(t -> t.index() > 0 && isContent(t.lower())
            && (Character.isDigit(t.text().charAt(0)) || Character.isUpperCase(t.text().charAt(0))))
        .map(Token::text).distinct().limit(3).toList();
    if (generic.isEmpty() && !specifics.isEmpty()) strengths.add("Specific details: " + quoteList(specifics) + ".");

    flags.sort((a, b) -> a.severity().compareTo(b.severity()));
    int score = score(fillerWords, st.size(), pt.size(), setup.isEmpty() && pt.size() >= 8, weakEnding,
        flags.stream().anyMatch(f -> f.fix() == PunchFix.MOVE_PUNCH_LAST),
        flags.stream().anyMatch(f -> f.fix() == PunchFix.HIDE_THE_TWIST), generic.size(), listItems);
    Metrics m = new Metrics(all.size(), st.size(), pt.size(), fillers, fillerWords,
        punchTok == null ? null : punchTok.text(), afterPunch, last == null ? null : last.text(), weakEnding,
        generic, listItems, cutTarget, score);
    return new Analysis(m, List.copyOf(flags), List.copyOf(strengths));
  }

  private Flag flag(PunchFix fix, Severity sev, String finding, String question, List<String> words, int seed) {
    return new Flag(fix, fix.label(), sev, finding, question, List.copyOf(words), examples.pick(fix, seed + fix.ordinal()));
  }

  static int score(int fillerWords, int setupWords, int punchWords, boolean oneLine, boolean weakEnding,
      boolean buried, boolean earlyReveal, int generic, int listItems) {
    int s = 100;
    s -= 6 * fillerWords;
    s -= 2 * Math.max(0, setupWords - SETUP_TARGET);
    s -= 2 * Math.max(0, punchWords - PUNCH_TARGET);
    if (oneLine) s -= 15;
    if (weakEnding) s -= 12;
    if (buried) s -= 10;
    if (earlyReveal) s -= 10;
    s -= 5 * generic;
    if (listItems >= 4) s -= 6;
    return Math.max(0, Math.min(100, s));
  }

  /** The most surprising-looking word of the punchline: long, new (not in the setup), specific. */
  static Token punchWord(List<Token> setup, List<Token> punch) {
    Token best = null;
    int bestScore = Integer.MIN_VALUE;
    for (Token t : punch) {
      if (!isContent(t.lower()) || GENERIC_NOUNS.contains(t.lower())) continue;
      int score = Math.min(t.lower().length(), 10);
      boolean inSetup = setup.stream().anyMatch(s -> isContent(s.lower()) && sameFamily(s.lower(), t.lower()));
      if (!inSetup) score += 4;
      // Probably a verb: surprises are usually nouns.
      if (t.lower().length() > 4 && (t.lower().endsWith("ed") || t.lower().endsWith("ing"))) score -= 2;
      char c = t.text().charAt(0);
      if (Character.isDigit(c) || (t.index() > 0 && Character.isUpperCase(c))) score += 2;
      if (score >= bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return best;
  }

  private static Token lastContent(List<Token> pt) {
    for (int i = pt.size() - 1; i >= 0; i--) {
      if (isContent(pt.get(i).lower()) && !WEAK_ENDINGS.contains(pt.get(i).lower())) return pt.get(i);
    }
    return null;
  }

  static List<String> findFillers(List<String> words) {
    List<String> out = new ArrayList<>();
    for (int i = 0; i < words.size(); i++) {
      boolean matched = false;
      for (List<String> phrase : FILLER_PHRASES) {
        if (i + phrase.size() <= words.size() && words.subList(i, i + phrase.size()).equals(phrase)) {
          out.add(String.join(" ", phrase));
          i += phrase.size() - 1;
          matched = true;
          break;
        }
      }
      if (!matched && FILLERS.contains(words.get(i))) out.add(words.get(i));
    }
    return out;
  }

  private static boolean endsWithFillerPhrase(List<Token> pt) {
    List<String> w = pt.stream().map(Token::lower).toList();
    for (List<String> phrase : FILLER_PHRASES) {
      if (w.size() >= phrase.size() && w.subList(w.size() - phrase.size(), w.size()).equals(phrase)) return true;
    }
    return false;
  }

  /**
   * Items in the longest comma list of any sentence: "A, B and C" = 3. Non-final items must be
   * short (a list, not a run-on of clauses).
   */
  static int listItems(String text) {
    int best = 0;
    for (String sentence : text.split("[.!?;:]+")) {
      String[] segs = sentence.split(",");
      if (segs.length < 2) continue;
      String lastSeg = segs[segs.length - 1].strip().toLowerCase(Locale.ROOT);
      boolean startsJoin = lastSeg.startsWith("and ") || lastSeg.startsWith("or ");
      boolean hasJoin = lastSeg.contains(" and ") || lastSeg.contains(" or ");
      if (!startsJoin && !hasJoin) continue;
      int run = 0;
      for (int i = segs.length - 2; i >= 0 && wordCount(segs[i]) <= 5 && wordCount(segs[i]) > 0; i--) run++;
      if (run == 0) continue;
      int items = run + (startsJoin ? 1 : 2);
      best = Math.max(best, items);
    }
    return best;
  }

  private static List<String> keepWords(List<Token> st, List<Token> pt) {
    return st.stream().filter(s -> isContent(s.lower()) && s.lower().length() >= 3)
        .filter(s -> pt.stream().anyMatch(p -> isContent(p.lower()) && sameFamily(p.lower(), s.lower())))
        .map(Token::text).distinct().limit(4).toList();
  }

  // ------------------------------------------------------------------ moves

  /** Concrete rewrite moves the user applies themselves (never a rewritten joke). */
  public List<Move> moves(String setup, String punch, Analysis a) {
    int seed = ((setup == null ? "" : setup) + "|" + punch).toLowerCase(Locale.ROOT).hashCode() + 7;
    List<Token> pt = tokens(punch);
    Token lastContent = lastContent(pt);
    List<Move> out = new ArrayList<>();
    for (Flag f : a.flags()) {
      String text = switch (f.fix()) {
        case SPLIT_SETUP -> f.words().isEmpty()
            ? "Find the moment the story turns. Put everything before it in the setup and the turn in the punchline."
            : "Split at '" + f.words().get(0) + "': what comes before is the setup. Then delete '" + f.words().get(0)
                + "', because the joke shouldn't explain itself.";
        case CUT_FILLER -> "Delete " + quoteList(f.words()) + ". Then read it aloud and check the meaning survived.";
        case END_ON_PUNCH -> lastContent == null
            ? "Rebuild the punchline so its final word is a concrete noun or a surprising verb."
            : "End on '" + lastContent.text() + "'. Delete " + (f.words().isEmpty() ? "what follows it" : quoteList(f.words()))
                + ", or reorder the sentence so '" + lastContent.text() + "' is the last thing they hear.";
        case MOVE_PUNCH_LAST -> "Rebuild the punchline so it ends on '" + f.words().get(0)
            + "'. Context first, surprise last. Try starting the sentence with what currently comes after it.";
        case HIDE_THE_TWIST -> "Take '" + f.words().get(0) + "' out of the setup. Describe the situation neutrally, "
            + "so the punchline is the first time we hear it.";
        case TRIM_SETUP -> "Rewrite the setup in " + SETUP_TARGET + " words or fewer (you're at " + a.metrics().setupWords() + "). "
            + (f.words().isEmpty() ? "Keep only what the punchline needs." : "Keep " + quoteList(f.words()) + ", because the punchline needs them. Everything else is negotiable.");
        case SHORTEN_PUNCH -> "Say the punchline in 8 words or fewer. A compact shape that often works: \"That's not X. That's Y.\"";
        case GET_SPECIFIC -> "Swap " + quoteList(f.words()) + " for a brand, a name, a place or a number. Picture the exact one.";
        case RULE_OF_THREE -> a.metrics().listItems() >= 4
            ? "Cut the list to three: keep the two most ordinary items, then make the third one wrong."
            : "Add a third item that sounds like it belongs but doesn't. Put it last.";
      };
      out.add(new Move(f.fix(), f.label(), text, f.words(), examples.pick(f.fix(), seed + f.fix().ordinal())));
    }
    if (a.metrics().punchWord() != null) {
      out.add(new Move(null, "Explore", "Write three alternative last words for the punchline (more specific, more extreme, "
          + "more personal) and keep the most surprising one.", List.of(), null));
    }
    out.add(new Move(null, "Explore", "Say it out loud in one breath. If you run out of air, it's still too long.",
        List.of(), null));
    return out;
  }

  // ------------------------------------------------------------------ critique

  public Critique critique(String setupBefore, String punchBefore, String setupAfter, String punchAfter) {
    Analysis b = analyse(setupBefore, punchBefore);
    Analysis a = analyse(setupAfter, punchAfter);
    Metrics mb = b.metrics(), ma = a.metrics();
    List<String> cut = new ArrayList<>(mb.fillers());
    for (String f : ma.fillers()) cut.remove(f);
    List<PunchFix> fixed = b.fixes().stream().filter(f -> !a.fixes().contains(f)).toList();
    List<PunchFix> remaining = a.fixes().stream().filter(b.fixes()::contains).toList();
    List<PunchFix> introduced = a.fixes().stream().filter(f -> !b.fixes().contains(f)).toList();

    List<String> notes = new ArrayList<>();
    int dw = ma.words() - mb.words();
    if (dw < 0) notes.add("Cut " + (-dw) + " word" + (dw == -1 ? "" : "s") + ": " + mb.words() + " to " + ma.words() + ".");
    else if (dw == 0) notes.add("Same length (" + ma.words() + " words). Tighter usually means shorter.");
    else notes.add("Added " + dw + " word" + (dw == 1 ? "" : "s") + " (" + mb.words() + " to " + ma.words() + "). Make sure every one of them earns its place.");
    if (!cut.isEmpty()) notes.add("Filler gone: " + quoteList(distinct(cut)) + ".");
    if (!ma.fillers().isEmpty()) notes.add("Filler still in: " + quoteList(distinct(ma.fillers())) + ".");
    if (ma.lastWord() != null) {
      if (!ma.weakEnding() && mb.weakEnding()) {
        notes.add("Now ends on '" + ma.lastWord() + "' instead of '" + mb.lastWord() + "'. The laugh has somewhere to land.");
      } else if (ma.weakEnding()) {
        notes.add("Still ends on a weak word ('" + ma.lastWord() + "').");
      }
    }
    if (mb.punchWord() != null && ma.punchWord() != null && ma.wordsAfterPunch() < mb.wordsAfterPunch()) {
      notes.add("Punch word moved closer to the end: '" + mb.punchWord() + "' had " + mb.wordsAfterPunch()
          + " words after it, '" + ma.punchWord() + "' has " + ma.wordsAfterPunch() + ".");
    }
    if (ma.setupWords() < mb.setupWords() && mb.setupWords() > SETUP_TARGET) {
      notes.add("Setup down from " + mb.setupWords() + " to " + ma.setupWords() + " words.");
    }
    for (PunchFix f : introduced) notes.add("New issue: " + f.label().toLowerCase(Locale.ROOT) + ".");

    int ds = ma.score() - mb.score();
    String verdict;
    if (a.flags().isEmpty()) verdict = "Clean. No flags left. Send it to the Arena and find out what strangers think.";
    else if (ds > 0 && dw > 0) verdict = "Sharper, but longer. Now cut whatever you added that doesn't earn its place.";
    else if (ds >= 15) verdict = "Much tighter. Now look at what's still open.";
    else if (ds > 0) verdict = "Better. Keep going: one more pass on what's still flagged.";
    else if (ds == 0) verdict = "Different, but not tighter yet. Pick one flag and fix only that.";
    else verdict = "This draft got looser. Compare the two side by side and keep what was sharper.";

    return new Critique(mb.words(), ma.words(), mb.punchWord(), mb.wordsAfterPunch(), ma.punchWord(),
        ma.wordsAfterPunch(), mb.score(), ma.score(), distinct(cut), fixed, remaining, introduced, notes, verdict,
        diff(joined(setupBefore, punchBefore), joined(setupAfter, punchAfter)));
  }

  private static String joined(String s, String p) {
    return ((s == null ? "" : s.strip()) + " " + (p == null ? "" : p.strip())).strip();
  }

  /** Word-level LCS diff (case-insensitive), in reading order. */
  static List<DiffToken> diff(String before, String after) {
    List<Token> a = tokens(before), b = tokens(after);
    int n = a.size(), m = b.size();
    int[][] dp = new int[n + 1][m + 1];
    for (int i = n - 1; i >= 0; i--) {
      for (int j = m - 1; j >= 0; j--) {
        dp[i][j] = a.get(i).lower().equals(b.get(j).lower()) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    List<DiffToken> out = new ArrayList<>();
    int i = 0, j = 0;
    while (i < n && j < m) {
      if (a.get(i).lower().equals(b.get(j).lower())) {
        out.add(new DiffToken(b.get(j).text(), DiffOp.SAME));
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        out.add(new DiffToken(a.get(i++).text(), DiffOp.REMOVED));
      } else {
        out.add(new DiffToken(b.get(j++).text(), DiffOp.ADDED));
      }
    }
    while (i < n) out.add(new DiffToken(a.get(i++).text(), DiffOp.REMOVED));
    while (j < m) out.add(new DiffToken(b.get(j++).text(), DiffOp.ADDED));
    return out;
  }

  // ------------------------------------------------------------------ helpers

  private static List<String> distinct(List<String> l) {
    return l.stream().distinct().toList();
  }

  private static String quoteList(List<String> words) {
    return words.stream().map(w -> "'" + w + "'").collect(Collectors.joining(", "));
  }
}
