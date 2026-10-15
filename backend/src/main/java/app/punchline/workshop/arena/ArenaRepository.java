package app.punchline.workshop.arena;

import app.punchline.core.JokeSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** Arena persistence: eligibility, Elo rows, votes and leaderboards (aggregate SQL via JdbcClient). */
@Repository
public class ArenaRepository {
  /**
   * Arena eligibility for {@code joke j LEFT JOIN workshop_arena_entry e}: an explicit entry wins;
   * otherwise drafts (NOTEBOOK, PUNCH_UP) stay private and every other source is in.
   */
  public static final String ELIGIBLE =
      "(COALESCE(e.status = 'ENTERED', j.source NOT IN ('NOTEBOOK', 'PUNCH_UP')) AND length(trim(j.punchline)) > 0)";

  public record PoolJoke(long id, UUID userId, String setup, String punchline, JokeSource source, String promptRef,
      double rating, int games) {}

  public record PairKey(long lo, long hi) {
    public static PairKey of(long a, long b) {
      return new PairKey(Math.min(a, b), Math.max(a, b));
    }
  }

  public record RatingRow(long jokeId, double rating, int wins, int losses) {}

  public record LeaderJokeRow(long jokeId, UUID userId, String setup, String punchline, String handle, double rating,
      int wins, int losses, Double gained) {}

  public record WriterRow(UUID userId, String handle, double rating, int jokes, int wins, int losses) {}

  public record MyJokeRow(long jokeId, String setup, String punchline, JokeSource source, Instant createdAt,
      boolean inArena, double rating, int wins, int losses) {}

  private final JdbcClient db;

  public ArenaRepository(JdbcClient db) {
    this.db = db;
  }

  // ---------------------------------------------------------------- eligibility

  public Map<Long, Boolean> eligibility(Collection<Long> jokeIds) {
    Map<Long, Boolean> out = new HashMap<>();
    if (jokeIds.isEmpty()) return out;
    db.sql("SELECT j.id, " + ELIGIBLE + " AS ok FROM joke j LEFT JOIN workshop_arena_entry e ON e.joke_id = j.id "
            + "WHERE j.id IN (:ids)")
        .param("ids", jokeIds)
        .query((rs, i) -> out.put(rs.getLong("id"), rs.getBoolean("ok")))
        .list();
    return out;
  }

  public void setEntry(long jokeId, ArenaStatus status) {
    db.sql("INSERT INTO workshop_arena_entry (joke_id, status) VALUES (:id, CAST(:s AS workshop_arena_status)) "
            + "ON CONFLICT (joke_id) DO UPDATE SET status = EXCLUDED.status, updated_at = now()")
        .param("id", jokeId).param("s", status.name()).update();
  }

  // ---------------------------------------------------------------- pairing

  /** Eligible jokes not written by {@code voter}, with their current rating (random sample if huge). */
  public List<PoolJoke> pool(UUID voter, int limit) {
    return db.sql("SELECT j.id, j.user_id, j.setup, j.punchline, j.source, j.prompt_ref, "
            + "COALESCE(r.rating, 1200) AS rating, COALESCE(r.wins + r.losses, 0) AS games "
            + "FROM joke j LEFT JOIN workshop_arena_entry e ON e.joke_id = j.id "
            + "LEFT JOIN workshop_joke_rating r ON r.joke_id = j.id "
            + "WHERE j.user_id <> :voter AND " + ELIGIBLE + " ORDER BY random() LIMIT :limit")
        .param("voter", voter).param("limit", limit)
        .query((rs, i) -> new PoolJoke(rs.getLong("id"), rs.getObject("user_id", UUID.class), rs.getString("setup"),
            rs.getString("punchline"), JokeSource.valueOf(rs.getString("source")), rs.getString("prompt_ref"),
            rs.getDouble("rating"), rs.getInt("games")))
        .list();
  }

  public Set<PairKey> votedPairs(UUID voter) {
    Set<PairKey> out = new HashSet<>();
    db.sql("SELECT left_joke_id, right_joke_id FROM workshop_vote WHERE voter_id = :v")
        .param("v", voter)
        .query((rs, i) -> out.add(PairKey.of(rs.getLong(1), rs.getLong(2))))
        .list();
    return out;
  }

  public boolean hasVoted(UUID voter, long a, long b) {
    return db.sql("SELECT count(*) FROM workshop_vote WHERE voter_id = :v "
            + "AND LEAST(left_joke_id, right_joke_id) = :lo AND GREATEST(left_joke_id, right_joke_id) = :hi")
        .param("v", voter).param("lo", Math.min(a, b)).param("hi", Math.max(a, b))
        .query(Long.class).single() > 0;
  }

  // ---------------------------------------------------------------- ratings and votes

  /** Ensures both rating rows exist and locks them (in id order, so concurrent votes can't deadlock). */
  public Map<Long, RatingRow> lockRatings(long a, long b) {
    db.sql("INSERT INTO workshop_joke_rating (joke_id) VALUES (:a), (:b) ON CONFLICT (joke_id) DO NOTHING")
        .param("a", a).param("b", b).update();
    Map<Long, RatingRow> out = new HashMap<>();
    db.sql("SELECT joke_id, rating, wins, losses FROM workshop_joke_rating WHERE joke_id IN (:a, :b) "
            + "ORDER BY joke_id FOR UPDATE")
        .param("a", a).param("b", b)
        .query((rs, i) -> out.put(rs.getLong(1), new RatingRow(rs.getLong(1), rs.getDouble(2), rs.getInt(3), rs.getInt(4))))
        .list();
    return out;
  }

  public void applyResult(long jokeId, double rating, boolean won) {
    db.sql("UPDATE workshop_joke_rating SET rating = :r, wins = wins + :w, losses = losses + :l, updated_at = now() "
            + "WHERE joke_id = :id")
        .param("r", rating).param("w", won ? 1 : 0).param("l", won ? 0 : 1).param("id", jokeId).update();
  }

  public void insertVote(UUID voter, long left, long right, Long winner, double delta) {
    db.sql("INSERT INTO workshop_vote (voter_id, left_joke_id, right_joke_id, outcome, winner_joke_id, delta) "
            + "VALUES (:v, :l, :r, CAST(:o AS workshop_vote_outcome), :w, :d)")
        .param("v", voter).param("l", left).param("r", right)
        .param("o", winner == null ? "SKIP" : "PICK").param("w", winner).param("d", delta)
        .update();
  }

  public int countPicks(UUID voter) {
    return db.sql("SELECT count(*) FROM workshop_vote WHERE voter_id = :v AND outcome = 'PICK'")
        .param("v", voter).query(Integer.class).single();
  }

  public Map<Long, RatingRow> ratings(Collection<Long> jokeIds) {
    Map<Long, RatingRow> out = new HashMap<>();
    if (jokeIds.isEmpty()) return out;
    db.sql("SELECT joke_id, rating, wins, losses FROM workshop_joke_rating WHERE joke_id IN (:ids)")
        .param("ids", jokeIds)
        .query((rs, i) -> out.put(rs.getLong(1), new RatingRow(rs.getLong(1), rs.getDouble(2), rs.getInt(3), rs.getInt(4))))
        .list();
    return out;
  }

  // ---------------------------------------------------------------- leaderboards

  public List<LeaderJokeRow> topJokesAllTime(int limit) {
    return db.sql("SELECT j.id, j.user_id, j.setup, j.punchline, u.handle, r.rating, r.wins, r.losses, NULL::float8 AS gained "
            + "FROM workshop_joke_rating r JOIN joke j ON j.id = r.joke_id JOIN app_user u ON u.id = j.user_id "
            + "LEFT JOIN workshop_arena_entry e ON e.joke_id = j.id "
            + "WHERE " + ELIGIBLE + " AND r.wins + r.losses > 0 "
            + "ORDER BY r.rating DESC, r.wins DESC, j.id LIMIT :limit")
        .param("limit", limit).query(ArenaRepository::leaderRow).list();
  }

  /** Jokes ranked by Elo points gained from votes cast in the last 7 days. */
  public List<LeaderJokeRow> topJokesThisWeek(int limit) {
    return db.sql("WITH recent AS (SELECT * FROM workshop_vote WHERE outcome = 'PICK' AND created_at >= now() - interval '7 days'), "
            + "moves AS ( "
            + "  SELECT winner_joke_id AS joke_id, delta AS pts, 1 AS w, 0 AS l FROM recent "
            + "  UNION ALL "
            + "  SELECT CASE WHEN winner_joke_id = left_joke_id THEN right_joke_id ELSE left_joke_id END, -delta, 0, 1 FROM recent) "
            + "SELECT j.id, j.user_id, j.setup, j.punchline, u.handle, COALESCE(r.rating, 1200) AS rating, "
            + "SUM(m.w)::int AS wins, SUM(m.l)::int AS losses, SUM(m.pts) AS gained "
            + "FROM moves m JOIN joke j ON j.id = m.joke_id JOIN app_user u ON u.id = j.user_id "
            + "LEFT JOIN workshop_joke_rating r ON r.joke_id = j.id LEFT JOIN workshop_arena_entry e ON e.joke_id = j.id "
            + "WHERE " + ELIGIBLE + " "
            + "GROUP BY j.id, j.user_id, j.setup, j.punchline, u.handle, r.rating "
            + "HAVING SUM(m.pts) > 0 ORDER BY gained DESC, rating DESC, j.id LIMIT :limit")
        .param("limit", limit).query(ArenaRepository::leaderRow).list();
  }

  /**
   * Writers ranked by the average Elo of their rated jokes, smoothed toward 1200 by two phantom
   * jokes so one lucky win doesn't top the table. The house writer is excluded.
   */
  public List<WriterRow> topWriters(UUID house, int minGames, int limit) {
    return db.sql(WRITERS_SQL + "HAVING SUM(r.wins + r.losses) >= :min ORDER BY rating DESC, wins DESC LIMIT :limit")
        .param("house", house).param("min", minGames).param("limit", limit)
        .query(ArenaRepository::writerRow).list();
  }

  /** The caller's writer rating (null until one of their jokes has been in a duel). */
  public WriterRow writer(UUID house, UUID userId) {
    return db.sql(WRITERS_SQL.replace("WHERE ", "WHERE u.id = :user AND ") + "")
        .param("house", house).param("user", userId)
        .query(ArenaRepository::writerRow).optional().orElse(null);
  }

  private static final String WRITERS_SQL =
      "SELECT u.id, u.handle, (SUM(r.rating) + 2 * 1200) / (COUNT(*) + 2) AS rating, COUNT(*)::int AS jokes, "
          + "SUM(r.wins)::int AS wins, SUM(r.losses)::int AS losses "
          + "FROM workshop_joke_rating r JOIN joke j ON j.id = r.joke_id JOIN app_user u ON u.id = j.user_id "
          + "WHERE r.wins + r.losses > 0 AND u.id <> :house "
          + "GROUP BY u.id, u.handle ";

  public List<MyJokeRow> myJokes(UUID userId) {
    return db.sql("SELECT j.id, j.setup, j.punchline, j.source, j.created_at, " + ELIGIBLE + " AS in_arena, "
            + "COALESCE(r.rating, 1200) AS rating, COALESCE(r.wins, 0) AS wins, COALESCE(r.losses, 0) AS losses "
            + "FROM joke j LEFT JOIN workshop_arena_entry e ON e.joke_id = j.id "
            + "LEFT JOIN workshop_joke_rating r ON r.joke_id = j.id "
            + "WHERE j.user_id = :u ORDER BY in_arena DESC, (COALESCE(r.wins, 0) + COALESCE(r.losses, 0) > 0) DESC, "
            + "rating DESC, j.created_at DESC")
        .param("u", userId)
        .query((rs, i) -> new MyJokeRow(rs.getLong("id"), rs.getString("setup"), rs.getString("punchline"),
            JokeSource.valueOf(rs.getString("source")), rs.getTimestamp("created_at").toInstant(),
            rs.getBoolean("in_arena"), rs.getDouble("rating"), rs.getInt("wins"), rs.getInt("losses")))
        .list();
  }

  private static LeaderJokeRow leaderRow(ResultSet rs, int i) throws SQLException {
    double gained = rs.getDouble("gained");
    return new LeaderJokeRow(rs.getLong("id"), rs.getObject("user_id", UUID.class), rs.getString("setup"),
        rs.getString("punchline"), rs.getString("handle"), rs.getDouble("rating"), rs.getInt("wins"),
        rs.getInt("losses"), rs.wasNull() ? null : gained);
  }

  private static WriterRow writerRow(ResultSet rs, int i) throws SQLException {
    return new WriterRow(rs.getObject("id", UUID.class), rs.getString("handle"), rs.getDouble("rating"),
        rs.getInt("jokes"), rs.getInt("wins"), rs.getInt("losses"));
  }
}
