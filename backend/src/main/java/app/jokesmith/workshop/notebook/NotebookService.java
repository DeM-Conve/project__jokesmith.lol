package app.jokesmith.workshop.notebook;

import static app.jokesmith.workshop.WorkshopJokes.*;

import app.jokesmith.core.Joke;
import app.jokesmith.core.JokeBank;
import app.jokesmith.core.JokeRepository;
import app.jokesmith.core.JokeSource;
import app.jokesmith.workshop.WorkshopJokes;
import app.jokesmith.workshop.arena.ArenaService;
import app.jokesmith.workshop.notebook.CallbackFinder.Match;
import app.jokesmith.workshop.notebook.CallbackFinder.Text;
import app.jokesmith.workshop.notebook.NotebookRepository.BitRow;
import app.jokesmith.workshop.notebook.NotebookRepository.JokeRow;
import app.jokesmith.workshop.notebook.NotebookRepository.TagCount;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The Bit Notebook: every joke the user wrote anywhere, plus tags, favourites, bits, callbacks. */
@Service
public class NotebookService {
  static final int MAX_BIT_JOKES = 40;

  public record NotebookJoke(long id, String setup, String punchline, JokeSource source, String promptRef,
      Instant createdAt, boolean favourite, List<String> tags, boolean inArena, int rating, int votes,
      Integer winRate) {}

  public record Filter(JokeSource source, String q, String tag, Boolean favourite) {}

  public record Bit(long id, String title, Instant createdAt, List<NotebookJoke> jokes) {}

  public record JokeRef(long id, String setup, String punchline) {}

  public record Callback(JokeRef a, JokeRef b, List<String> sharedWords, double score, String hint) {}

  private final NotebookRepository repo;
  private final JokeRepository jokes;
  private final JokeBank bank;
  private final WorkshopJokes owned;
  private final ArenaService arena;

  public NotebookService(NotebookRepository repo, JokeRepository jokes, JokeBank bank, WorkshopJokes owned,
      ArenaService arena) {
    this.repo = repo;
    this.jokes = jokes;
    this.bank = bank;
    this.owned = owned;
    this.arena = arena;
  }

  // ---------------------------------------------------------------- jokes

  @Transactional(readOnly = true)
  public List<NotebookJoke> list(UUID userId, Filter f) {
    String q = f.q() == null ? "" : f.q().strip().toLowerCase(Locale.ROOT);
    String tag = f.tag() == null ? "" : f.tag().strip().toLowerCase(Locale.ROOT);
    return all(userId).stream()
        .filter(j -> f.source() == null || j.source() == f.source())
        .filter(j -> f.favourite() == null || j.favourite() == f.favourite())
        .filter(j -> q.isEmpty() || (j.setup() + " " + j.punchline()).toLowerCase(Locale.ROOT).contains(q))
        .filter(j -> tag.isEmpty() || j.tags().stream().anyMatch(t -> t.toLowerCase(Locale.ROOT).equals(tag)))
        .toList();
  }

  private List<NotebookJoke> all(UUID userId) {
    Map<Long, List<String>> tags = repo.tagsByJoke(userId);
    return repo.jokes(userId).stream().map(r -> toDto(r, tags.getOrDefault(r.id(), List.of()))).toList();
  }

  private static NotebookJoke toDto(JokeRow r, List<String> tags) {
    return new NotebookJoke(r.id(), r.setup(), r.punchline(), r.source(), r.promptRef(), r.createdAt(),
        r.favourite(), tags, r.inArena(), (int) Math.round(r.rating()), r.votes(),
        r.votes() == 0 ? null : (int) Math.round(100.0 * r.wins() / r.votes()));
  }

  private NotebookJoke one(UUID userId, long id) {
    return all(userId).stream().filter(j -> j.id() == id).findFirst().orElseThrow(() -> notFound("Joke " + id + " not found"));
  }

  @Transactional
  public NotebookJoke create(UUID userId, String setup, String punchline, List<String> tags) {
    Joke j = bank.save(userId, clean(setup), punchline.strip(), JokeSource.NOTEBOOK, null);
    if (tags != null && !tags.isEmpty()) repo.replaceTags(userId, j.getId(), normaliseTags(tags));
    return one(userId, j.getId());
  }

  @Transactional
  public NotebookJoke update(UUID userId, long id, String setup, String punchline, List<String> tags) {
    Joke j = owned.owned(userId, id);
    j.setSetup(clean(setup));
    j.setPunchline(punchline.strip());
    jokes.saveAndFlush(j);
    if (tags != null) repo.replaceTags(userId, id, normaliseTags(tags));
    return one(userId, id);
  }

  @Transactional
  public void delete(UUID userId, long id) {
    jokes.delete(owned.owned(userId, id));
    jokes.flush();
    repo.deleteOrphanTags(userId);
  }

  @Transactional
  public NotebookJoke setFavourite(UUID userId, long id, boolean favourite) {
    owned.owned(userId, id);
    repo.setFavourite(id, favourite);
    return one(userId, id);
  }

  @Transactional
  public NotebookJoke setTags(UUID userId, long id, List<String> tags) {
    owned.owned(userId, id);
    repo.replaceTags(userId, id, normaliseTags(tags));
    return one(userId, id);
  }

  @Transactional
  public NotebookJoke setInArena(UUID userId, long id, boolean inArena) {
    owned.owned(userId, id);
    arena.setInArena(id, inArena);
    return one(userId, id);
  }

  @Transactional(readOnly = true)
  public List<TagCount> tags(UUID userId) {
    return repo.tags(userId);
  }

  static List<String> normaliseTags(List<String> tags) {
    Map<String, String> seen = new LinkedHashMap<>();
    for (String t : tags) {
      if (t == null) continue;
      String s = t.strip().replaceAll("\\s+", " ");
      if (s.startsWith("#")) s = s.substring(1);
      if (s.isEmpty()) continue;
      if (s.length() > 32) throw badRequest("Tags are at most 32 characters");
      seen.putIfAbsent(s.toLowerCase(Locale.ROOT), s);
    }
    if (seen.size() > 8) throw badRequest("At most 8 tags per joke");
    return List.copyOf(seen.values());
  }

  private static String clean(String s) {
    return s == null ? "" : s.strip();
  }

  // ---------------------------------------------------------------- callbacks

  @Transactional(readOnly = true)
  public List<Callback> callbacks(UUID userId, Long focusId) {
    if (focusId != null) owned.owned(userId, focusId);
    List<Text> texts = repo.jokes(userId).stream().map(r -> new Text(r.id(), r.setup(), r.punchline())).toList();
    List<Callback> out = new ArrayList<>();
    for (Match m : CallbackFinder.find(texts, focusId, focusId == null ? 12 : 6)) {
      out.add(new Callback(ref(m.a()), ref(m.b()), m.sharedWords(), m.score(), hint(m)));
    }
    return out;
  }

  private static JokeRef ref(Text t) {
    return new JokeRef(t.id(), t.setup(), t.punchline());
  }

  private static String hint(Match m) {
    String w = m.sharedWords().get(0);
    return switch ((int) (Math.abs(m.a().id() * 31 + m.b().id()) % 3)) {
      case 0 -> "Tell one of these first. When '" + w + "' comes back in the other, the audience gets a bonus laugh for remembering.";
      case 1 -> "Both jokes live near '" + w + "'. Put them in one bit and end the set by bringing '" + w + "' back.";
      default -> "Try a callback: close the second joke with a twist on the first joke's '" + w + "'.";
    };
  }

  // ---------------------------------------------------------------- bits

  @Transactional(readOnly = true)
  public List<Bit> bits(UUID userId) {
    Map<Long, NotebookJoke> byId = all(userId).stream().collect(Collectors.toMap(NotebookJoke::id, Function.identity()));
    Map<Long, List<Long>> members = repo.bitJokes(userId);
    List<Bit> out = new ArrayList<>();
    for (BitRow b : repo.bits(userId)) {
      List<NotebookJoke> js = members.getOrDefault(b.id(), List.of()).stream().map(byId::get)
          .filter(java.util.Objects::nonNull).toList();
      out.add(new Bit(b.id(), b.title(), b.createdAt(), js));
    }
    return out;
  }

  private Bit bit(UUID userId, long id) {
    return bits(userId).stream().filter(b -> b.id() == id).findFirst().orElseThrow(() -> notFound("Bit " + id + " not found"));
  }

  @Transactional
  public Bit createBit(UUID userId, String title, List<Long> jokeIds) {
    long id = repo.createBit(userId, title.strip());
    if (jokeIds != null && !jokeIds.isEmpty()) setBitJokes(userId, id, jokeIds);
    return bit(userId, id);
  }

  @Transactional
  public Bit renameBit(UUID userId, long id, String title) {
    ownBit(userId, id);
    repo.renameBit(id, title.strip());
    return bit(userId, id);
  }

  @Transactional
  public void deleteBit(UUID userId, long id) {
    ownBit(userId, id);
    repo.deleteBit(id);
  }

  /** Sets the bit's jokes in this exact order (add, remove and reorder in one call). */
  @Transactional
  public Bit setBitJokes(UUID userId, long id, List<Long> jokeIds) {
    ownBit(userId, id);
    Set<Long> seen = new HashSet<>();
    for (Long j : jokeIds) {
      if (j == null || !seen.add(j)) throw badRequest("Each joke can appear in a bit once");
      owned.owned(userId, j);
    }
    if (jokeIds.size() > MAX_BIT_JOKES) throw badRequest("A bit holds at most " + MAX_BIT_JOKES + " jokes");
    repo.setBitJokes(id, jokeIds);
    return bit(userId, id);
  }

  private void ownBit(UUID userId, long id) {
    if (!repo.bitOwner(id).map(userId::equals).orElse(false)) throw notFound("Bit " + id + " not found");
  }
}
