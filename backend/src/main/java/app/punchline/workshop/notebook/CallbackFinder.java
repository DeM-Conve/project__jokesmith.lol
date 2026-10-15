package app.punchline.workshop.notebook;

import static app.punchline.workshop.WorkshopText.*;

import app.punchline.workshop.WorkshopText.Token;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Finds callback opportunities: pairs of the user's jokes that share a key noun (non-stopword,
 * singularised), weighted so rare shared words count more than common ones.
 */
public final class CallbackFinder {
  private CallbackFinder() {}

  public record Text(long id, String setup, String punchline) {}

  public record Match(Text a, Text b, List<String> sharedWords, double score) {}

  /** Verbs and adjectives that slip past the stopword list but make useless callbacks. */
  private static final Set<String> IGNORE = Set.of(
      "see", "saw", "look", "looked", "take", "took", "come", "came", "give", "gave", "need", "feel", "felt",
      "try", "tried", "keep", "kept", "put", "use", "used", "find", "found", "call", "called", "start", "started",
      "turn", "turned", "ask", "asked", "seem", "nice", "great", "best", "better", "worse", "worst", "whole",
      "entire", "real", "sure", "right", "wrong", "old", "young", "long", "short", "high", "low", "full", "half",
      "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "hundred", "thousand", "year",
      "week", "month", "minute", "hour", "today", "tonight", "yesterday", "tomorrow", "nothing", "everything",
      "anything", "everyone", "anyone", "nobody", "somehow", "something", "thing", "stuff");

  /** Key nouns of a joke: stem -> first spelling seen. */
  static Map<String, String> keyWords(Text t) {
    Map<String, String> out = new LinkedHashMap<>();
    List<Token> all = new ArrayList<>(tokens(t.setup()));
    all.addAll(tokens(t.punchline()));
    for (Token tok : all) {
      String w = tok.lower();
      if (w.length() < 3 || !isContent(w) || IGNORE.contains(w) || GENERIC_NOUNS.contains(w)) continue;
      if (w.chars().allMatch(Character::isDigit)) continue;
      String stem = stem(w);
      if (IGNORE.contains(stem) || stem.length() < 3) continue;
      out.putIfAbsent(stem, stem);
    }
    return out;
  }

  /**
   * Callback pairs, best first. With {@code focusId} only pairs involving that joke (it is
   * always {@code a}); otherwise the strongest pairs across the whole notebook.
   */
  public static List<Match> find(List<Text> jokes, Long focusId, int limit) {
    Map<Long, Map<String, String>> words = new HashMap<>();
    Map<String, Integer> df = new HashMap<>();
    for (Text t : jokes) {
      Map<String, String> k = keyWords(t);
      words.put(t.id(), k);
      k.keySet().forEach(s -> df.merge(s, 1, Integer::sum));
    }
    int n = jokes.size();
    List<Match> out = new ArrayList<>();
    for (int i = 0; i < jokes.size(); i++) {
      for (int j = i + 1; j < jokes.size(); j++) {
        Text a = jokes.get(i), b = jokes.get(j);
        if (focusId != null && a.id() != focusId && b.id() != focusId) continue;
        if (focusId != null && b.id() == focusId) {
          Text tmp = a;
          a = b;
          b = tmp;
        }
        Map<String, String> wb = words.get(b.id());
        List<String> shared = new ArrayList<>();
        double score = 0;
        for (var e : words.get(a.id()).entrySet()) {
          if (wb.containsKey(e.getKey())) {
            shared.add(e.getValue());
            score += Math.log((n + 1.0) / df.get(e.getKey())) + 0.5;
          }
        }
        if (!shared.isEmpty()) out.add(new Match(a, b, shared, Math.round(score * 100) / 100.0));
      }
    }
    out.sort(Comparator.comparingDouble(Match::score).reversed());
    return out.size() > limit ? out.subList(0, limit) : out;
  }
}
