package app.punchline.workshop.arena;

import static app.punchline.workshop.WorkshopJokes.*;

import app.punchline.core.ActivityLog;
import app.punchline.core.ComedySkill;
import app.punchline.core.Joke;
import app.punchline.core.JokeRepository;
import app.punchline.core.JokeSource;
import app.punchline.workshop.arena.ArenaRepository.LeaderJokeRow;
import app.punchline.workshop.arena.ArenaRepository.PairKey;
import app.punchline.workshop.arena.ArenaRepository.PoolJoke;
import app.punchline.workshop.arena.ArenaRepository.RatingRow;
import app.punchline.workshop.arena.ArenaRepository.WriterRow;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Head-to-head duels between anonymous jokes, Elo ratings and leaderboards. */
@Service
public class ArenaService {
  static final int VOTES_PER_XP = 10;
  static final int FEEDBACK_XP = 10;
  private static final int POOL_SAMPLE = 3000;

  public enum Period { WEEK, ALL }

  /** An anonymous joke in a duel: no writer, no rating until after the vote. */
  public record DuelJoke(long id, String setup, String punchline) {}

  /** {@code left}/{@code right} are null when the voter has judged every available pair. */
  public record Pair(DuelJoke left, DuelJoke right, String promptLabel, boolean samePrompt, int votesCast,
      int nextXpIn) {}

  public record VoteRequest(long leftId, long rightId, Long winnerId) {}

  public record RatingChange(long jokeId, int before, int after) {}

  public record VoteResult(boolean skipped, RatingChange left, RatingChange right, int delta, int votesCast,
      int nextXpIn, boolean xpAwarded) {}

  public record LeaderJoke(int rank, long jokeId, String setup, String punchline, String handle, boolean house,
      boolean mine, int rating, int wins, int losses, Integer gained) {}

  public record Writer(int rank, String handle, boolean me, int rating, int jokes, int wins, int losses) {}

  public record Leaderboard(Period period, List<LeaderJoke> jokes, List<Writer> writers) {}

  public record MyJoke(long jokeId, String setup, String punchline, JokeSource source, Instant createdAt,
      boolean inArena, int rating, int wins, int losses, int votes, Integer winRate) {}

  public record MyArena(Integer writerRating, Integer writerRank, int votesCast, int nextXpIn, List<MyJoke> jokes) {}

  private final ArenaRepository repo;
  private final JokeRepository jokes;
  private final ActivityLog activity;

  public ArenaService(ArenaRepository repo, JokeRepository jokes, ActivityLog activity) {
    this.repo = repo;
    this.jokes = jokes;
    this.activity = activity;
  }

  // ---------------------------------------------------------------- pairing

  /**
   * The next duel for {@code voter}: two eligible jokes, neither written by the voter, never a
   * pair they've already judged. Prefers jokes with few duels, matched against a close rating.
   * {@code samePrompt} restricts both jokes to one (source, prompt_ref) group.
   */
  @Transactional(readOnly = true)
  public Pair nextPair(UUID voter, boolean samePrompt) {
    int votes = repo.countPicks(voter);
    int nextXp = VOTES_PER_XP - votes % VOTES_PER_XP;
    PoolJoke[] pick = choosePair(repo.pool(voter, POOL_SAMPLE), repo.votedPairs(voter), samePrompt);
    if (pick == null) return new Pair(null, null, null, samePrompt, votes, nextXp);
    String label = samePrompt ? promptLabel(pick[0].source(), pick[0].promptRef()) : null;
    return new Pair(duel(pick[0]), duel(pick[1]), label, samePrompt, votes, nextXp);
  }

  /** Pair selection rules, separated for testing. Returns {left, right} or null. */
  static PoolJoke[] choosePair(List<PoolJoke> pool, Set<PairKey> voted, boolean samePrompt) {
    ThreadLocalRandom rnd = ThreadLocalRandom.current();
    Map<String, List<PoolJoke>> groups = samePrompt
        ? pool.stream().filter(j -> j.promptRef() != null && !j.promptRef().isBlank())
            .collect(Collectors.groupingBy(j -> j.source() + "|" + j.promptRef()))
        : Map.of("*", pool);

    List<PoolJoke> anchors = new ArrayList<>();
    groups.values().stream().filter(g -> g.size() >= 2).forEach(anchors::addAll);
    Collections.shuffle(anchors, rnd);
    // Fewest duels first (in buckets of 3, so it's not strictly deterministic).
    anchors.sort(Comparator.comparingInt(j -> j.games() / 3));

    for (PoolJoke a : anchors) {
      List<PoolJoke> group = samePrompt ? groups.get(a.source() + "|" + a.promptRef()) : pool;
      PoolJoke best = null;
      double bestScore = Double.MAX_VALUE;
      for (PoolJoke b : group) {
        if (b.id() == a.id() || voted.contains(PairKey.of(a.id(), b.id()))) continue;
        double score = Math.abs(a.rating() - b.rating()) + rnd.nextDouble() * 150
            + (Objects.equals(a.userId(), b.userId()) ? 100 : 0);
        if (score < bestScore) {
          bestScore = score;
          best = b;
        }
      }
      if (best != null) return rnd.nextBoolean() ? new PoolJoke[] {a, best} : new PoolJoke[] {best, a};
    }
    return null;
  }

  private static DuelJoke duel(PoolJoke j) {
    return new DuelJoke(j.id(), j.setup(), j.punchline());
  }

  static String promptLabel(JokeSource source, String ref) {
    if (ref == null) return null;
    if (ref.startsWith("house:")) return "Topic: " + ref.substring(6).replace('-', ' ');
    String src = switch (source) {
      case DAILY_RIFF -> "Daily Riff";
      case FORMULA_GYM -> "Formula Gym";
      case PUNCH_UP -> "Punch-Up";
      case BANTER -> "Banter";
      case ASSOCIATION -> "Association";
      case NOTEBOOK -> "Notebook";
      case DELIVERY -> "Delivery";
    };
    return src + ": " + ref;
  }

  // ---------------------------------------------------------------- voting

  @Transactional
  public VoteResult vote(UUID voter, VoteRequest r) {
    long l = r.leftId(), rt = r.rightId();
    if (l == rt) throw badRequest("A joke can't duel itself");
    if (r.winnerId() != null && r.winnerId() != l && r.winnerId() != rt) {
      throw badRequest("The winner must be one of the two jokes");
    }
    Joke left = jokes.findById(l).orElseThrow(() -> notFound("Joke " + l + " not found"));
    Joke right = jokes.findById(rt).orElseThrow(() -> notFound("Joke " + rt + " not found"));
    if (left.getUserId().equals(voter) || right.getUserId().equals(voter)) {
      throw badRequest("You can't vote on your own joke");
    }
    Map<Long, Boolean> ok = repo.eligibility(List.of(l, rt));
    if (!ok.getOrDefault(l, false) || !ok.getOrDefault(rt, false)) throw conflict("That joke isn't in the arena");
    if (repo.hasVoted(voter, l, rt)) throw conflict("You've already judged this pair");

    if (r.winnerId() == null) {
      insertVote(voter, l, rt, null, 0);
      int votes = repo.countPicks(voter);
      return new VoteResult(true, null, null, 0, votes, VOTES_PER_XP - votes % VOTES_PER_XP, false);
    }

    long winner = r.winnerId(), loser = winner == l ? rt : l;
    Map<Long, RatingRow> rows = repo.lockRatings(l, rt);
    double rw = rows.get(winner).rating(), rl = rows.get(loser).rating();
    double delta = Elo.delta(rw, rl);
    repo.applyResult(winner, rw + delta, true);
    repo.applyResult(loser, rl - delta, false);
    insertVote(voter, l, rt, winner, delta);

    int votes = repo.countPicks(voter);
    boolean xp = votes % VOTES_PER_XP == 0;
    if (xp) activity.record(voter, ComedySkill.FEEDBACK, FEEDBACK_XP);
    RatingChange cl = change(l, rows.get(l).rating(), winner == l ? delta : -delta);
    RatingChange cr = change(rt, rows.get(rt).rating(), winner == rt ? delta : -delta);
    return new VoteResult(false, cl, cr, (int) Math.round(delta), votes, VOTES_PER_XP - votes % VOTES_PER_XP, xp);
  }

  private void insertVote(UUID voter, long l, long r, Long winner, double delta) {
    try {
      repo.insertVote(voter, l, r, winner, delta);
    } catch (DataIntegrityViolationException e) {
      throw conflict("You've already judged this pair");
    }
  }

  private static RatingChange change(long id, double before, double d) {
    return new RatingChange(id, (int) Math.round(before), (int) Math.round(before + d));
  }

  // ---------------------------------------------------------------- leaderboards

  @Transactional(readOnly = true)
  public Leaderboard leaderboard(UUID me, Period period) {
    List<LeaderJokeRow> rows = period == Period.WEEK ? repo.topJokesThisWeek(20) : repo.topJokesAllTime(20);
    List<LeaderJoke> top = new ArrayList<>();
    for (LeaderJokeRow j : rows) {
      top.add(new LeaderJoke(top.size() + 1, j.jokeId(), j.setup(), j.punchline(), j.handle(),
          HOUSE_USER.equals(j.userId()), me.equals(j.userId()), (int) Math.round(j.rating()), j.wins(), j.losses(),
          j.gained() == null ? null : (int) Math.round(j.gained())));
    }
    List<Writer> writers = new ArrayList<>();
    for (WriterRow w : repo.topWriters(HOUSE_USER, 3, 20)) {
      writers.add(new Writer(writers.size() + 1, w.handle(), me.equals(w.userId()), (int) Math.round(w.rating()),
          w.jokes(), w.wins(), w.losses()));
    }
    return new Leaderboard(period, top, writers);
  }

  @Transactional(readOnly = true)
  public MyArena mine(UUID me) {
    WriterRow w = repo.writer(HOUSE_USER, me);
    Integer rank = null;
    if (w != null) {
      List<WriterRow> all = repo.topWriters(HOUSE_USER, 0, 10_000);
      for (int i = 0; i < all.size(); i++) if (all.get(i).userId().equals(me)) rank = i + 1;
    }
    int votes = repo.countPicks(me);
    List<MyJoke> list = repo.myJokes(me).stream().map(j -> {
      int games = j.wins() + j.losses();
      return new MyJoke(j.jokeId(), j.setup(), j.punchline(), j.source(), j.createdAt(), j.inArena(),
          (int) Math.round(j.rating()), j.wins(), j.losses(), games,
          games == 0 ? null : (int) Math.round(100.0 * j.wins() / games));
    }).toList();
    return new MyArena(w == null ? null : (int) Math.round(w.rating()), rank, votes,
        VOTES_PER_XP - votes % VOTES_PER_XP, list);
  }

  /** Enter or withdraw one of the caller's jokes (ownership is checked by the caller). */
  @Transactional
  public void setInArena(long jokeId, boolean inArena) {
    repo.setEntry(jokeId, inArena ? ArenaStatus.ENTERED : ArenaStatus.WITHDRAWN);
  }

  @Transactional(readOnly = true)
  public boolean inArena(long jokeId) {
    return repo.eligibility(List.of(jokeId)).getOrDefault(jokeId, false);
  }
}
