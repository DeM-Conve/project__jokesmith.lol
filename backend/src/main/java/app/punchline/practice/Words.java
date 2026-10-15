package app.punchline.practice;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/** Tiny text helpers shared by the rule-based coaches. */
public final class Words {
  private Words() {}

  private static final Set<String> STOP = Set.of(
      "the", "a", "an", "and", "or", "of", "to", "in", "on", "at", "for", "with", "my", "your", "his", "her",
      "their", "our", "is", "it", "its", "that", "this", "be", "was", "you", "i", "me", "we", "they", "who",
      "what", "from", "by", "as", "are", "so", "but", "not", "no", "just", "all", "one", "out", "up", "too",
      "have", "has", "had", "did", "does", "about", "into", "than", "then", "there", "were", "been", "can", "will");

  /** Lower-case words of 3+ letters, minus stop words, crudely de-pluralised. */
  public static List<String> content(String text) {
    List<String> out = new ArrayList<>();
    for (String w : text.toLowerCase(Locale.ROOT).split("[^\\p{L}\\p{N}]+")) {
      if (w.length() < 3 || STOP.contains(w)) continue;
      out.add(w.length() > 4 && w.endsWith("s") ? w.substring(0, w.length() - 1) : w);
    }
    return out;
  }
}
