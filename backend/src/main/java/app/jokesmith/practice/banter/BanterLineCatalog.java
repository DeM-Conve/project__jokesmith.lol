package app.jokesmith.practice.banter;

import app.jokesmith.practice.CuratedText;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Component;

/** The curated bank of conversational lines with technique-tagged example replies. */
@Component
public class BanterLineCatalog {
  public record Example(BanterTechnique technique, String text) {}

  /** {@code key} is stable within a persona, e.g. FRIEND-07 (stored with each round). */
  public record Line(String key, BanterPersona persona, String text, List<Example> examples) {}

  private final Map<String, Line> byKey = new LinkedHashMap<>();
  private final Map<BanterPersona, List<Line>> byPersona = new EnumMap<>(BanterPersona.class);

  public BanterLineCatalog() {
    this(CuratedText.lines("practice/banter-lines.txt"));
  }

  BanterLineCatalog(List<String> lines) {
    for (BanterPersona p : BanterPersona.values()) byPersona.put(p, new ArrayList<>());
    BanterPersona persona = null;
    String text = null;
    List<Example> examples = new ArrayList<>();
    for (String raw : lines) {
      if (raw.startsWith("@ ")) {
        add(persona, text, examples);
        String[] parts = raw.substring(2).split("\\|", 2);
        persona = BanterPersona.valueOf(parts[0].strip());
        text = parts[1].strip();
        examples = new ArrayList<>();
      } else if (text != null && raw.contains("|")) {
        String[] parts = raw.split("\\|", 2);
        try {
          examples.add(new Example(BanterTechnique.valueOf(parts[0].strip()), parts[1].strip()));
        } catch (IllegalArgumentException ignored) {
          // unknown technique tag: skip the example rather than fail startup
        }
      }
    }
    add(persona, text, examples);
    if (byKey.isEmpty()) throw new IllegalStateException("no banter lines found");
  }

  private void add(BanterPersona persona, String text, List<Example> examples) {
    if (persona == null || text == null || examples.isEmpty()) return;
    List<Line> list = byPersona.get(persona);
    String key = "%s-%02d".formatted(persona.name(), list.size() + 1);
    Line line = new Line(key, persona, text, List.copyOf(examples));
    list.add(line);
    byKey.put(key, line);
  }

  public List<Line> forPersona(BanterPersona persona) {
    return List.copyOf(byPersona.get(persona));
  }

  public Optional<Line> get(String key) {
    return Optional.ofNullable(byKey.get(key));
  }

  public int size() {
    return byKey.size();
  }
}
