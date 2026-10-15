package app.punchline.practice.association;

import app.punchline.practice.CuratedText;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

/** Curated association lists per topic (resource practice/association-topics.txt). */
@Component
public class AssociationTopicCatalog {
  public record Topic(String name, Map<AssociationCategory, List<String>> items) {}

  private final Map<String, Topic> topics;

  public AssociationTopicCatalog() {
    this(CuratedText.lines("practice/association-topics.txt"));
  }

  AssociationTopicCatalog(List<String> lines) {
    Map<String, Topic> out = new LinkedHashMap<>();
    String name = null;
    Map<AssociationCategory, List<String>> items = null;
    for (String line : lines) {
      if (line.startsWith("## ")) {
        if (name != null) out.put(key(name), new Topic(name, items));
        name = line.substring(3).strip();
        items = new EnumMap<>(AssociationCategory.class);
      } else if (name != null && line.contains(":")) {
        String head = line.substring(0, line.indexOf(':')).strip();
        try {
          AssociationCategory cat = AssociationCategory.valueOf(head);
          items.put(cat, Arrays.stream(line.substring(line.indexOf(':') + 1).split("\\|"))
              .map(String::strip).filter(s -> !s.isEmpty()).toList());
        } catch (IllegalArgumentException ignored) {
          // not a category line
        }
      }
    }
    if (name != null) out.put(key(name), new Topic(name, items));
    this.topics = out;
  }

  public List<String> names() {
    return topics.values().stream().map(Topic::name).toList();
  }

  /** Exact (case-insensitive) match, else the curated topic sharing the most words with {@code topic}. */
  public Optional<Topic> find(String topic) {
    Topic exact = topics.get(key(topic));
    if (exact != null) return Optional.of(exact);
    List<String> words = Collisions.contentWords(topic);
    Topic best = null;
    int bestScore = 0;
    for (Topic t : topics.values()) {
      List<String> tw = Collisions.contentWords(t.name());
      int score = 0;
      for (String w : words) if (tw.contains(w)) score++;
      if (score > bestScore) {
        best = t;
        bestScore = score;
      }
    }
    return Optional.ofNullable(best);
  }

  private static String key(String s) {
    return s.strip().toLowerCase(Locale.ROOT);
  }

  List<Topic> all() {
    return new ArrayList<>(topics.values());
  }
}
