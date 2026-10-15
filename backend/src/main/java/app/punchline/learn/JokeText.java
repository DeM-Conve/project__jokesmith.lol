package app.punchline.learn;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Small, dependency-free text helpers for reading the shape of a joke. */
final class JokeText {
  private JokeText() {}

  /** Words that never carry a punch: a joke ending on one of these is trailing off. */
  static final Set<String> FILLER = Set.of(
      "a", "an", "the", "it", "its", "it's", "is", "was", "were", "be", "been", "am", "are", "do", "did", "does",
      "i", "me", "my", "you", "your", "he", "him", "his", "she", "her", "we", "us", "our", "they", "them", "their",
      "to", "of", "in", "on", "at", "for", "with", "by", "from", "as", "into", "about", "up", "out", "off",
      "and", "or", "but", "so", "then", "than", "that", "this", "these", "those", "there", "here",
      "too", "though", "anyway", "again", "really", "very", "just", "now", "right", "yet", "either", "also",
      "lol", "haha", "lmao", "ok", "okay", "honestly", "basically", "literally", "y'know", "know",
      "i'm", "that's", "what", "who", "which", "have", "has", "had", "get", "got", "all", "some", "if", "when",
      "would", "could", "should", "will", "can", "not", "don't", "didn't", "isn't", "wasn't", "one", "said");

  /** Common words that don't count as an "image" when comparing setup and punch. */
  private static final Set<String> COMMON = Set.of(
      "like", "time", "people", "thing", "things", "way", "day", "make", "made", "want", "say", "says", "told",
      "tell", "see", "go", "going", "went", "come", "came", "still", "every", "never", "always", "much", "more",
      "most", "only", "even", "being", "because", "how", "why", "where", "after", "before", "over", "until",
      "dont", "cant", "wont", "ive", "youre", "theyre", "thats", "were", "she's", "he's", "no", "yes", "good");

  private static final Pattern TOKEN = Pattern.compile("[\\p{L}\\p{N}][\\p{L}\\p{N}'’-]*");
  private static final Pattern SENTENCE_BREAK = Pattern.compile("(?<=[.!?…][\"”’')]?)\\s+|\\s*\\n+\\s*");

  record Split(String setup, String punchline) {}

  static String clean(String text) {
    if (text == null) return "";
    return text.replace('\r', '\n').replaceAll("[ \\t]+", " ").replaceAll("\\n{2,}", "\n").strip();
  }

  /** Setup = everything before the last sentence boundary (or strong pause); punchline = the rest. */
  static Split split(String raw) {
    String text = clean(raw);
    List<String> sentences = new ArrayList<>();
    for (String s : SENTENCE_BREAK.split(text)) if (!s.isBlank()) sentences.add(s.strip());
    if (sentences.size() >= 2) {
      String punch = sentences.get(sentences.size() - 1);
      String setup = String.join(" ", sentences.subList(0, sentences.size() - 1));
      return new Split(setup, punch);
    }
    String one = text.replace('\n', ' ');
    // Strong pauses: the punch starts after the marker.
    for (String marker : List.of(" — ", " – ", " -- ", " - ", "...", "…", ": ", "; ")) {
      int at = lastBreak(one, marker);
      if (at >= 0) return new Split(one.substring(0, at).strip(), one.substring(at + marker.length()).strip());
    }
    // Soft pauses: the conjunction belongs to the punch.
    for (String marker : List.of(", but ", ", so ", ", and then ", ", until ", ", which ", ", ")) {
      int at = lastBreak(one, marker);
      if (at >= 0) return new Split(one.substring(0, at + 1).strip(), one.substring(at + 2).strip());
    }
    return new Split("", one);
  }

  private static int lastBreak(String text, String marker) {
    int at = text.lastIndexOf(marker);
    if (at < Math.max(8, text.length() / 4)) return -1;
    String rest = text.substring(at + marker.length());
    return tokens(rest).isEmpty() ? -1 : at;
  }

  static List<String> tokens(String text) {
    List<String> out = new ArrayList<>();
    if (text == null) return out;
    Matcher m = TOKEN.matcher(text);
    while (m.find()) {
      String t = m.group().replaceAll("['’-]+$", "");
      if (!t.isEmpty()) out.add(t);
    }
    return out;
  }

  static int wordCount(String text) {
    return tokens(text).size();
  }

  static String norm(String word) {
    return word.toLowerCase(Locale.ROOT).replace('’', '\'');
  }

  /** Very rough stem so "dogs", "dog's" and "dog" meet; good enough to spot an echo. */
  static String stem(String word) {
    String w = norm(word).replace("'", "");
    if (w.endsWith("ies") && w.length() > 4) return w.substring(0, w.length() - 3) + "y";
    if (w.endsWith("ing") && w.length() > 5) return w.substring(0, w.length() - 3);
    if (w.endsWith("ed") && w.length() > 4) return w.substring(0, w.length() - 2);
    if (w.endsWith("es") && w.length() > 4) return w.substring(0, w.length() - 2);
    if (w.endsWith("s") && !w.endsWith("ss") && w.length() > 3) return w.substring(0, w.length() - 1);
    return w;
  }

  static boolean isContent(String word) {
    String n = norm(word);
    return n.length() >= 3 && !FILLER.contains(n) && !COMMON.contains(n.replace("'", ""));
  }

  /** Content-word stems, in order of first appearance. */
  static Set<String> contentStems(String text) {
    Set<String> out = new LinkedHashSet<>();
    for (String t : tokens(text)) if (isContent(t)) out.add(stem(t));
    return out;
  }

  /** The punch word: the last word of the punchline that isn't filler. */
  static String punchWord(String punch) {
    List<String> toks = tokens(punch);
    for (int i = toks.size() - 1; i >= 0; i--) {
      if (!FILLER.contains(norm(toks.get(i)))) return toks.get(i);
    }
    return toks.isEmpty() ? "" : toks.get(toks.size() - 1);
  }

  /** Words trailing after the punch word (empty when the punch word is last). */
  static List<String> trailing(String punch) {
    List<String> toks = tokens(punch);
    String pw = punchWord(punch);
    int idx = toks.lastIndexOf(pw);
    return idx < 0 ? List.of() : toks.subList(idx + 1, toks.size());
  }

  static boolean punchWordLast(String punch) {
    return trailing(punch).isEmpty();
  }

  /** A content word of the setup that comes back in the punch (often the connector). */
  static String echo(String setup, String punch) {
    Set<String> punchStems = contentStems(punch);
    String found = null;
    for (String t : tokens(setup)) {
      if (isContent(t) && punchStems.contains(stem(t))) found = t;
    }
    return found;
  }

  /** The last content word of a text, or "" if none. */
  static String lastContent(String text) {
    List<String> toks = tokens(text);
    for (int i = toks.size() - 1; i >= 0; i--) if (isContent(toks.get(i))) return toks.get(i);
    return "";
  }

  /** Lowercase, letters/digits only, single spaces: for comparing two spans of text. */
  static String flat(String text) {
    return String.join(" ", tokens(text)).toLowerCase(Locale.ROOT).replace('’', '\'');
  }

  static String clip(String text, int words) {
    List<String> toks = List.of(clean(text).split(" "));
    return toks.size() <= words ? clean(text) : String.join(" ", toks.subList(0, words)) + "…";
  }
}
