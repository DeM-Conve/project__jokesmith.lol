package app.punchline.workshop.punchup;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * The curated before/after library ({@code resources/workshop/punchup-examples.json}): every
 * flag the coach raises is shown next to a worked example of the same fix.
 */
@Component
public class PunchUpExamples {
  public record Lines(String setup, String punchline) {}

  public record Example(PunchFix fix, Lines before, Lines after, String note) {}

  private final List<Example> all;
  private final Map<PunchFix, List<Example>> byFix;

  public PunchUpExamples(ObjectMapper json) {
    try (InputStream in = getClass().getResourceAsStream("/workshop/punchup-examples.json")) {
      all = List.copyOf(json.readValue(in, new TypeReference<List<Example>>() {}));
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
    Map<PunchFix, List<Example>> m = new EnumMap<>(PunchFix.class);
    m.putAll(all.stream().collect(Collectors.groupingBy(Example::fix)));
    byFix = m;
  }

  public List<Example> all() {
    return all;
  }

  public List<Example> forFix(PunchFix fix) {
    return byFix.getOrDefault(fix, List.of());
  }

  /** One example for this fix, varied by {@code seed} so different jokes see different examples. */
  public Example pick(PunchFix fix, int seed) {
    List<Example> list = forFix(fix);
    return list.isEmpty() ? null : list.get(Math.floorMod(seed, list.size()));
  }
}
