package app.jokesmith.practice.association;

import app.jokesmith.practice.Words;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * Rule-based collision picker: pairs two associations from different columns,
 * preferring pairs that share no words (distant ideas collide hardest), and rates
 * how surprising each pairing is on a 1-5 scale.
 */
public final class Collisions {
  private Collisions() {}

  public record Item(AssociationCategory category, String text, boolean suggested) {}

  public record Collision(Item a, Item b, int surprise, String why, String prompt) {}

  /** Lower-case content words (see {@link Words#content}). */
  public static List<String> contentWords(String text) {
    return Words.content(text);
  }

  static boolean shareWords(String a, String b) {
    List<String> wb = contentWords(b);
    for (String w : contentWords(a)) {
      for (String x : wb) {
        if (w.equals(x) || (w.length() >= 5 && x.length() >= 5 && w.substring(0, 5).equals(x.substring(0, 5)))) {
          return true;
        }
      }
    }
    return false;
  }

  /** Category pairs whose collisions usually land furthest apart. */
  private static boolean farApart(AssociationCategory x, AssociationCategory y) {
    Set<AssociationCategory> s = Set.of(x, y);
    return s.equals(Set.of(AssociationCategory.FEELINGS, AssociationCategory.THINGS))
        || s.equals(Set.of(AssociationCategory.FEELINGS, AssociationCategory.PLACES))
        || s.equals(Set.of(AssociationCategory.PHRASES, AssociationCategory.THINGS))
        || s.equals(Set.of(AssociationCategory.PEOPLE, AssociationCategory.PHRASES));
  }

  static int surprise(Item a, Item b) {
    int s = 2;
    if (!shareWords(a.text(), b.text())) s++;
    if (farApart(a.category(), b.category())) s++;
    // Specific beats generic: two multi-word associations make a vivider collision.
    if (a.text().trim().contains(" ") && b.text().trim().contains(" ")) s++;
    if (shareWords(a.text(), b.text()) && a.text().length() < 12 && b.text().length() < 12) s--;
    return Math.max(1, Math.min(5, s));
  }

  static String why(Item a, Item b, int surprise) {
    if (shareWords(a.text(), b.text())) return "These two overlap a bit, so the jump is short. Safe, but rarely a big laugh.";
    return switch (surprise) {
      case 5 -> "Nothing in common on the surface. If you find the hidden link, that's the joke.";
      case 4 -> "Different worlds. Look for the one way they're secretly the same.";
      case 3 -> "A decent distance apart. Push one side to an extreme.";
      default -> "Close neighbours. Try treating one as if it were the other.";
    };
  }

  static String prompt(Item a, Item b) {
    AssociationCategory x = a.category();
    AssociationCategory y = b.category();
    if (x == AssociationCategory.PHRASES || y == AssociationCategory.PHRASES) {
      Item phrase = x == AssociationCategory.PHRASES ? a : b;
      Item other = phrase == a ? b : a;
      return "Who would say \"" + phrase.text() + "\" about " + other.text() + ", and why is it wrong?";
    }
    if (x == AssociationCategory.FEELINGS || y == AssociationCategory.FEELINGS) {
      Item feeling = x == AssociationCategory.FEELINGS ? a : b;
      Item other = feeling == a ? b : a;
      return "When does " + other.text() + " make you feel " + feeling.text() + "?";
    }
    if (x == AssociationCategory.PEOPLE || y == AssociationCategory.PEOPLE) {
      Item person = x == AssociationCategory.PEOPLE ? a : b;
      Item other = person == a ? b : a;
      return "Put " + person.text() + " in charge of " + other.text() + ". What goes wrong first?";
    }
    return "Describe " + a.text() + " as if it were " + b.text() + ".";
  }

  /**
   * Up to {@code limit} collisions, each item used at most once, most surprising first.
   * {@code seed} makes the shuffle repeatable per session and re-roll.
   */
  public static List<Collision> pick(List<Item> items, int limit, long seed) {
    List<Collision> candidates = new ArrayList<>();
    for (int i = 0; i < items.size(); i++) {
      for (int j = i + 1; j < items.size(); j++) {
        Item a = items.get(i);
        Item b = items.get(j);
        if (a.category() == b.category()) continue;
        int s = surprise(a, b);
        candidates.add(new Collision(a, b, s, why(a, b, s), prompt(a, b)));
      }
    }
    Collections.shuffle(candidates, new Random(seed));
    // User-written pairs first within a surprise level: it's their brainstorm being mined.
    candidates.sort(Comparator.comparingInt(Collision::surprise).reversed()
        .thenComparingInt(c -> (c.a().suggested() ? 1 : 0) + (c.b().suggested() ? 1 : 0)));
    List<Collision> out = new ArrayList<>();
    Set<Item> used = new HashSet<>();
    for (Collision c : candidates) {
      if (out.size() >= limit) break;
      if (used.contains(c.a()) || used.contains(c.b())) continue;
      used.add(c.a());
      used.add(c.b());
      out.add(c);
    }
    return out;
  }
}
