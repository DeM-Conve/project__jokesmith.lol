package app.jokesmith.learn;

import app.jokesmith.learn.LearnDtos.Credit;
import app.jokesmith.learn.LearnDtos.GymFormula;
import app.jokesmith.learn.LearnDtos.ModelAnswer;
import app.jokesmith.learn.LearnDtos.Premise;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/**
 * The curated, hand-written content of the learn feature, loaded once from
 * {@code src/main/resources/learn/*.json}: Formula Gym formulas, premises and
 * model answers, and the hand-annotated X-ray gallery.
 */
@Component
public class LearnContent {

  /**
   * Raw gallery entry as written in xray-gallery.json: a famous joke, credited to its comedian,
   * with the page that verifies its wording ({@code sourceUrl}) and an optional English
   * {@code translation} for lines performed in Hindi or Hinglish.
   */
  public record GalleryEntry(String id, String difficulty, List<String> tags, String comedian, String source,
      String sourceUrl, String translation, JokeFormula formula, List<JokeFormula> alsoAccept, String setup,
      String punchline, String punchWord, String targetAssumption, String connector, String reinterpretation,
      String whyItWorks) {
    public Credit credit() {
      return new Credit(comedian, source, sourceUrl, translation);
    }
  }

  private final List<GymFormula> formulas;
  private final Map<JokeFormula, GymFormula> formulaByKey;
  private final List<Premise> premises;
  private final Map<String, Premise> premiseById;
  private final List<ModelAnswer> modelAnswers;
  private final List<GalleryEntry> gallery;
  private final Map<String, GalleryEntry> galleryById;

  public LearnContent(ObjectMapper mapper) {
    ObjectMapper json = mapper.copy().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
    formulas = read(json, "learn/gym-formulas.json", new TypeReference<>() {});
    premises = read(json, "learn/gym-premises.json", new TypeReference<>() {});
    modelAnswers = read(json, "learn/gym-model-answers.json", new TypeReference<>() {});
    gallery = read(json, "learn/xray-gallery.json", new TypeReference<>() {});
    formulaByKey = index(formulas, GymFormula::key);
    premiseById = index(premises, Premise::id);
    galleryById = index(gallery, GalleryEntry::id);
    for (ModelAnswer a : modelAnswers) {
      if (!premiseById.containsKey(a.premiseId())) throw new IllegalStateException("Unknown premise " + a.premiseId());
    }
  }

  private static <T> List<T> read(ObjectMapper json, String path, TypeReference<List<T>> type) {
    try (InputStream in = new ClassPathResource(path).getInputStream()) {
      return List.copyOf(json.readValue(in, type));
    } catch (IOException e) {
      throw new UncheckedIOException("Cannot load " + path, e);
    }
  }

  private static <K, T> Map<K, T> index(List<T> items, Function<T, K> key) {
    return items.stream().collect(Collectors.toMap(key, t -> t, (a, b) -> {
      throw new IllegalStateException("Duplicate key in learn content: " + key.apply(a));
    }, LinkedHashMap::new));
  }

  public List<GymFormula> formulas() { return formulas; }
  public Optional<GymFormula> formula(JokeFormula key) { return Optional.ofNullable(formulaByKey.get(key)); }
  public List<Premise> premises() { return premises; }
  public Optional<Premise> premise(String id) { return Optional.ofNullable(premiseById.get(id)); }
  public List<ModelAnswer> modelAnswers() { return modelAnswers; }
  public List<GalleryEntry> gallery() { return gallery; }
  public Optional<GalleryEntry> galleryEntry(String id) { return Optional.ofNullable(galleryById.get(id)); }
}
