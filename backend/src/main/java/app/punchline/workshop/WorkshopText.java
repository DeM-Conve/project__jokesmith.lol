package app.punchline.workshop;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Word-level text helpers shared by the punch-up analyser and the callback finder. */
public final class WorkshopText {
  private WorkshopText() {}

  private static final Pattern WORD = Pattern.compile("[\\p{L}\\p{N}]+(?:['’][\\p{L}]+)*(?:-[\\p{L}\\p{N}]+)*");

  /** A word as written plus its lower-case form and its index in the token list. */
  public record Token(String text, String lower, int index) {}

  public static List<Token> tokens(String s) {
    List<Token> out = new ArrayList<>();
    if (s == null) return out;
    Matcher m = WORD.matcher(s);
    while (m.find()) {
      String t = m.group();
      out.add(new Token(t, t.toLowerCase(Locale.ROOT).replace('’', '\''), out.size()));
    }
    return out;
  }

  public static int wordCount(String s) {
    return tokens(s).size();
  }

  /** Function words: never the punch, never a callback noun, weak as a last word. */
  public static final Set<String> STOPWORDS = Set.of(
      "a", "an", "the", "and", "or", "but", "nor", "so", "yet", "if", "then", "than", "because", "as", "of",
      "to", "in", "on", "at", "by", "for", "with", "about", "from", "into", "onto", "over", "under", "up",
      "down", "out", "off", "after", "before", "while", "during", "through", "between", "against", "without",
      "i", "me", "my", "mine", "myself", "you", "your", "yours", "he", "him", "his", "she", "her", "hers",
      "it", "its", "we", "us", "our", "they", "them", "their", "this", "that", "these", "those", "there",
      "here", "who", "whom", "whose", "which", "what", "when", "where", "why", "how", "all", "any", "both",
      "each", "few", "more", "most", "other", "some", "such", "no", "not", "only", "own", "same", "too",
      "can", "will", "would", "should", "could", "might", "must", "shall", "may", "do", "does", "did", "done",
      "doing", "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having",
      "i'm", "i've", "i'd", "i'll", "it's", "that's", "there's", "he's", "she's", "you're", "we're",
      "they're", "don't", "doesn't", "didn't", "can't", "won't", "isn't", "wasn't", "aren't", "what's",
      "let's", "who's", "now", "again", "once", "also", "even", "still", "ever", "never", "always", "every",
      "one", "get", "got", "gets", "getting", "go", "goes", "going", "went", "gone", "make", "makes", "made",
      "say", "says", "said", "tell", "told", "know", "knew", "think", "thought", "want", "wants", "wanted",
      "like", "just", "really", "very", "actually", "basically", "literally", "honestly", "totally", "yeah",
      "oh", "okay", "ok", "well", "though", "either", "else", "anyway", "way", "lot", "lots", "much", "many",
      "day", "time", "times", "new", "good", "bad", "big", "little", "first", "last", "next", "back",
      "s", "t", "re", "ve", "ll", "d");

  /** Hedges and stalling words: the classic economy offenders (single words). */
  public static final Set<String> FILLERS = Set.of(
      "really", "very", "just", "actually", "basically", "literally", "honestly", "totally", "pretty",
      "quite", "somewhat", "seriously", "definitely", "simply", "obviously", "truly", "um", "uh", "anyway",
      "anyways", "apparently", "clearly", "essentially", "generally", "personally", "suddenly");

  /** Multi-word stalls ("kind of", "you know", "the funny thing is"). Matched on lower-case words. */
  public static final List<List<String>> FILLER_PHRASES = List.of(
      List.of("kind", "of"), List.of("sort", "of"), List.of("you", "know"), List.of("i", "mean"),
      List.of("i", "guess"), List.of("i", "swear"), List.of("to", "be", "honest"), List.of("at", "all"),
      List.of("or", "something"), List.of("and", "stuff"), List.of("the", "funny", "thing", "is"),
      List.of("if", "you", "think", "about", "it"), List.of("needless", "to", "say"),
      List.of("for", "some", "reason"), List.of("at", "the", "end", "of", "the", "day"),
      List.of("in", "order", "to"), List.of("a", "little", "bit"));

  /** Nouns nobody can picture. Specific is funny. */
  public static final Set<String> GENERIC_NOUNS = Set.of(
      "thing", "things", "stuff", "something", "someone", "somebody", "person", "people", "guy", "guys",
      "place", "places", "somewhere", "item", "items", "whatever", "food", "animal", "object", "situation");

  /** Words that make a weak final beat: the laugh should land on a strong word. */
  public static final Set<String> WEAK_ENDINGS;

  static {
    var s = new java.util.HashSet<>(STOPWORDS);
    s.addAll(FILLERS);
    s.addAll(Set.of("lol", "haha", "right", "stuff", "things", "etc", "though", "today", "lately",
        "anymore", "sometimes", "again", "probably", "maybe", "for", "me"));
    // Content-ish words that are fine to end on.
    s.removeAll(Set.of("never", "always", "first", "last", "back", "new", "bad", "good", "big", "no",
        "nothing"));
    WEAK_ENDINGS = Set.copyOf(s);
  }

  public static boolean isContent(String lower) {
    return lower.length() > 1 && !STOPWORDS.contains(lower) && !FILLERS.contains(lower);
  }

  /** Crude singular/possessive normalisation for matching nouns across jokes. */
  public static String stem(String lower) {
    String w = lower.replace("’", "'");
    if (w.endsWith("'s")) w = w.substring(0, w.length() - 2);
    if (w.endsWith("'")) w = w.substring(0, w.length() - 1);
    if (w.length() > 4 && w.endsWith("ies")) return w.substring(0, w.length() - 3) + "y";
    if (w.length() > 4 && (w.endsWith("ches") || w.endsWith("shes") || w.endsWith("xes"))) {
      return w.substring(0, w.length() - 2);
    }
    if (w.length() > 3 && w.endsWith("s") && !w.endsWith("ss") && !w.endsWith("us")) {
      return w.substring(0, w.length() - 1);
    }
    return w;
  }

  /** Same word family: identical stems, or a shared 5+ letter prefix (manager / management). */
  public static boolean sameFamily(String a, String b) {
    String sa = stem(a), sb = stem(b);
    if (sa.equals(sb)) return true;
    return sa.length() >= 5 && sb.length() >= 5 && sa.regionMatches(0, sb, 0, 5);
  }
}
