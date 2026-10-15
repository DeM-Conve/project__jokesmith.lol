package app.punchline.practice.association;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.core.Joke;
import app.punchline.core.JokeBank;
import app.punchline.core.JokeRepository;
import app.punchline.core.JokeSource;
import app.punchline.practice.association.AssociationDtos.*;
import app.punchline.practice.association.Collisions.Collision;
import app.punchline.practice.association.Collisions.Item;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Association mapper: brainstorm a topic in five columns, then collide two distant
 * associations into a joke. Curated topic lists top up the brainstorm afterwards, and
 * {@link Collisions} picks and rates the pairs.
 */
@Service
public class AssociationService {
  static final int XP = 25;
  static final int COLLISIONS = 5;
  static final int SUGGESTIONS_PER_CATEGORY = 4;
  /** Fewer of the user's own items than this and curated ones join the collision pool. */
  static final int MIN_OWN_ITEMS = 6;

  static final List<String> TIPS = List.of(
      "Your first three associations are everyone's first three. The good stuff is at the bottom of the list.",
      "Be specific: not \"a dog\" but \"a labrador who has eaten a sock\". Specific is funny; general is a greeting card.",
      "Feelings are the secret column. A topic plus an unexpected feeling is half a joke already.",
      "Write down the clichés. A cliché is a setup the audience already knows, so you only need the twist.",
      "Look for the one surprising way two unrelated things are the same. That link is the joke.",
      "If a collision feels impossible, exaggerate one side until it fits.",
      "Ask \"who would say this?\" and \"where would this be a disaster?\" for every phrase.",
      "Don't judge while you list. Editing is a different muscle; brainstorming is volume.");

  private final AssociationTopicCatalog catalog;
  private final AssociationSessionRepository sessions;
  private final AssociationItemRepository items;
  private final JokeBank bank;
  private final JokeRepository jokes;
  private final ActivityLog activity;

  public AssociationService(AssociationTopicCatalog catalog, AssociationSessionRepository sessions,
      AssociationItemRepository items, JokeBank bank, JokeRepository jokes, ActivityLog activity) {
    this.catalog = catalog;
    this.sessions = sessions;
    this.items = items;
    this.bank = bank;
    this.jokes = jokes;
    this.activity = activity;
  }

  public TopicsDto topics() {
    List<CategoryDto> cats = Arrays.stream(AssociationCategory.values())
        .map(c -> new CategoryDto(c, c.label, c.hint)).toList();
    return new TopicsDto(catalog.names(), cats, TIPS);
  }

  @Transactional
  public MapDto start(UUID userId, StartRequest req) {
    AssociationSession session = sessions.save(new AssociationSession(userId, req.topic().strip()));
    int pos = 0;
    Set<String> seen = new HashSet<>();
    for (ItemDto i : req.items()) {
      String text = i.text().strip();
      if (text.isEmpty() || !seen.add(i.category() + ":" + text.toLowerCase(Locale.ROOT))) continue;
      items.save(new AssociationItem(session.getId(), i.category(), text, pos++));
    }
    return map(session, 0);
  }

  @Transactional
  public MapDto addItem(UUID userId, long id, ItemDto item) {
    AssociationSession session = owned(userId, id);
    List<AssociationItem> existing = items.findBySessionIdOrderByPosition(id);
    String text = item.text().strip();
    boolean dup = existing.stream().anyMatch(e -> e.getCategory() == item.category() && e.getText().equalsIgnoreCase(text));
    if (!dup) items.save(new AssociationItem(id, item.category(), text, existing.size()));
    return map(session, 0);
  }

  @Transactional(readOnly = true)
  public MapDto get(UUID userId, long id, int shuffle) {
    return map(owned(userId, id), shuffle);
  }

  @Transactional
  public JokeResultDto writeJoke(UUID userId, long id, JokeRequest req) {
    AssociationSession session = owned(userId, id);
    String setup = req.setup() == null || req.setup().isBlank()
        ? session.getTopic() + ": " + req.a().strip() + " × " + req.b().strip()
        : req.setup().strip();
    Joke joke = bank.save(userId, setup, req.punchline().strip(), JokeSource.ASSOCIATION, ref(id));
    int xp = 0;
    if (session.complete()) {
      xp = XP;
      activity.record(userId, ComedySkill.ASSOCIATION, xp);
    }
    return new JokeResultDto(joke.getId(), xp, jokeCount(id));
  }

  private MapDto map(AssociationSession session, int shuffle) {
    List<AssociationItem> own = items.findBySessionIdOrderByPosition(session.getId());
    Optional<AssociationTopicCatalog.Topic> curated = catalog.find(session.getTopic());
    Random rnd = new Random(session.getId() * 7_919L + shuffle);

    Set<String> ownTexts = new HashSet<>();
    own.forEach(i -> ownTexts.add(i.getText().toLowerCase(Locale.ROOT)));
    Map<AssociationCategory, List<String>> suggestions = new EnumMap<>(AssociationCategory.class);
    curated.ifPresent(t -> t.items().forEach((cat, list) -> {
      List<String> fresh = new ArrayList<>(list.stream().filter(s -> !ownTexts.contains(s.toLowerCase(Locale.ROOT))).toList());
      Collections.shuffle(fresh, new Random(session.getId() + cat.ordinal()));
      suggestions.put(cat, List.copyOf(fresh.subList(0, Math.min(SUGGESTIONS_PER_CATEGORY, fresh.size()))));
    }));

    List<Item> pool = new ArrayList<>(own.stream().map(i -> new Item(i.getCategory(), i.getText(), false)).toList());
    long ownCategories = own.stream().map(AssociationItem::getCategory).distinct().count();
    if (pool.size() < MIN_OWN_ITEMS || ownCategories < 2) {
      Set<Item> extra = new LinkedHashSet<>();
      suggestions.forEach((cat, list) -> list.forEach(s -> extra.add(new Item(cat, s, true))));
      if (extra.isEmpty()) {
        // An uncurated topic with a thin brainstorm: borrow from a random curated topic's
        // feelings and phrases, which collide with almost anything.
        List<AssociationTopicCatalog.Topic> all = catalog.all();
        if (!all.isEmpty()) {
          AssociationTopicCatalog.Topic t = all.get(rnd.nextInt(all.size()));
          for (AssociationCategory c : List.of(AssociationCategory.FEELINGS, AssociationCategory.PHRASES)) {
            t.items().getOrDefault(c, List.of()).stream().limit(3).forEach(s -> extra.add(new Item(c, s, true)));
          }
        }
      }
      pool.addAll(extra);
    }
    List<CollisionDto> collisions = Collisions.pick(pool, COLLISIONS, rnd.nextLong()).stream()
        .map(AssociationService::toDto).toList();

    List<String> tips = new ArrayList<>(TIPS);
    Collections.shuffle(tips, rnd);
    return new MapDto(session.getId(), session.getTopic(), curated.map(AssociationTopicCatalog.Topic::name).orElse(null),
        own.stream().map(i -> new ItemDto(i.getCategory(), i.getText())).toList(),
        suggestions, collisions, tips.subList(0, 3), jokeCount(session.getId()));
  }

  private static CollisionDto toDto(Collision c) {
    return new CollisionDto(
        new CollisionItemDto(c.a().category(), c.a().text(), c.a().suggested()),
        new CollisionItemDto(c.b().category(), c.b().text(), c.b().suggested()),
        c.surprise(), c.why(), c.prompt());
  }

  private int jokeCount(long sessionId) {
    return jokes.findBySourceAndPromptRef(JokeSource.ASSOCIATION, ref(sessionId)).size();
  }

  private static String ref(long sessionId) {
    return "assoc:" + sessionId;
  }

  private AssociationSession owned(UUID userId, long id) {
    return sessions.findByIdAndUserId(id, userId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such association map"));
  }
}
