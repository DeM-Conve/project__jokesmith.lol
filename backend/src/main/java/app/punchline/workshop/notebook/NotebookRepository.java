package app.punchline.workshop.notebook;

import app.punchline.core.JokeSource;
import app.punchline.workshop.arena.ArenaRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

/** Notebook decorations on the shared joke bank: favourites, tags, bits, arena stats. */
@Repository
public class NotebookRepository {
  public record JokeRow(long id, String setup, String punchline, JokeSource source, String promptRef,
      Instant createdAt, boolean favourite, boolean inArena, double rating, int votes, int wins) {}

  public record TagCount(String name, int count) {}

  public record BitRow(long id, String title, Instant createdAt) {}

  private final JdbcClient db;

  public NotebookRepository(JdbcClient db) {
    this.db = db;
  }

  public List<JokeRow> jokes(UUID userId) {
    return db.sql("SELECT j.id, j.setup, j.punchline, j.source, j.prompt_ref, j.created_at, "
            + "(f.joke_id IS NOT NULL) AS favourite, " + ArenaRepository.ELIGIBLE + " AS in_arena, "
            + "COALESCE(r.rating, 1200) AS rating, COALESCE(r.wins + r.losses, 0) AS votes, COALESCE(r.wins, 0) AS wins "
            + "FROM joke j LEFT JOIN workshop_favourite f ON f.joke_id = j.id "
            + "LEFT JOIN workshop_arena_entry e ON e.joke_id = j.id "
            + "LEFT JOIN workshop_joke_rating r ON r.joke_id = j.id "
            + "WHERE j.user_id = :u ORDER BY j.created_at DESC, j.id DESC")
        .param("u", userId)
        .query((rs, i) -> new JokeRow(rs.getLong("id"), rs.getString("setup"), rs.getString("punchline"),
            JokeSource.valueOf(rs.getString("source")), rs.getString("prompt_ref"),
            rs.getTimestamp("created_at").toInstant(), rs.getBoolean("favourite"), rs.getBoolean("in_arena"),
            rs.getDouble("rating"), rs.getInt("votes"), rs.getInt("wins")))
        .list();
  }

  /** joke id -> tag names, for every tagged joke of the user. */
  public Map<Long, List<String>> tagsByJoke(UUID userId) {
    Map<Long, List<String>> out = new LinkedHashMap<>();
    db.sql("SELECT jt.joke_id, t.name FROM workshop_joke_tag jt JOIN workshop_tag t ON t.id = jt.tag_id "
            + "WHERE t.user_id = :u ORDER BY lower(t.name)")
        .param("u", userId)
        .query((rs, i) -> out.computeIfAbsent(rs.getLong(1), k -> new ArrayList<>()).add(rs.getString(2)))
        .list();
    return out;
  }

  public List<TagCount> tags(UUID userId) {
    return db.sql("SELECT t.name, count(jt.joke_id)::int AS n FROM workshop_tag t "
            + "LEFT JOIN workshop_joke_tag jt ON jt.tag_id = t.id WHERE t.user_id = :u "
            + "GROUP BY t.id, t.name ORDER BY n DESC, lower(t.name)")
        .param("u", userId)
        .query((rs, i) -> new TagCount(rs.getString(1), rs.getInt(2)))
        .list();
  }

  public void setFavourite(long jokeId, boolean favourite) {
    if (favourite) {
      db.sql("INSERT INTO workshop_favourite (joke_id) VALUES (:j) ON CONFLICT DO NOTHING").param("j", jokeId).update();
    } else {
      db.sql("DELETE FROM workshop_favourite WHERE joke_id = :j").param("j", jokeId).update();
    }
  }

  /** Replaces a joke's tags, creating tags as needed and dropping the user's now-unused ones. */
  public void replaceTags(UUID userId, long jokeId, List<String> names) {
    db.sql("DELETE FROM workshop_joke_tag WHERE joke_id = :j").param("j", jokeId).update();
    for (String name : names) {
      db.sql("INSERT INTO workshop_tag (user_id, name) VALUES (:u, :n) ON CONFLICT (user_id, lower(name)) DO NOTHING")
          .param("u", userId).param("n", name).update();
      db.sql("INSERT INTO workshop_joke_tag (joke_id, tag_id) "
              + "SELECT :j, id FROM workshop_tag WHERE user_id = :u AND lower(name) = lower(:n) ON CONFLICT DO NOTHING")
          .param("j", jokeId).param("u", userId).param("n", name).update();
    }
    deleteOrphanTags(userId);
  }

  public void deleteOrphanTags(UUID userId) {
    db.sql("DELETE FROM workshop_tag t WHERE t.user_id = :u "
            + "AND NOT EXISTS (SELECT 1 FROM workshop_joke_tag jt WHERE jt.tag_id = t.id)")
        .param("u", userId).update();
  }

  // ---------------------------------------------------------------- bits

  public List<BitRow> bits(UUID userId) {
    return db.sql("SELECT id, title, created_at FROM workshop_bit WHERE user_id = :u ORDER BY created_at DESC, id DESC")
        .param("u", userId)
        .query((rs, i) -> new BitRow(rs.getLong(1), rs.getString(2), rs.getTimestamp(3).toInstant()))
        .list();
  }

  /** bit id -> ordered joke ids. */
  public Map<Long, List<Long>> bitJokes(UUID userId) {
    Map<Long, List<Long>> out = new LinkedHashMap<>();
    db.sql("SELECT bj.bit_id, bj.joke_id FROM workshop_bit_joke bj JOIN workshop_bit b ON b.id = bj.bit_id "
            + "WHERE b.user_id = :u ORDER BY bj.bit_id, bj.position")
        .param("u", userId)
        .query((rs, i) -> out.computeIfAbsent(rs.getLong(1), k -> new ArrayList<>()).add(rs.getLong(2)))
        .list();
    return out;
  }

  public Optional<UUID> bitOwner(long bitId) {
    return db.sql("SELECT user_id FROM workshop_bit WHERE id = :b").param("b", bitId).query(UUID.class).optional();
  }

  public long createBit(UUID userId, String title) {
    return db.sql("INSERT INTO workshop_bit (user_id, title) VALUES (:u, :t) RETURNING id")
        .param("u", userId).param("t", title).query(Long.class).single();
  }

  public void renameBit(long bitId, String title) {
    db.sql("UPDATE workshop_bit SET title = :t WHERE id = :b").param("t", title).param("b", bitId).update();
  }

  public void deleteBit(long bitId) {
    db.sql("DELETE FROM workshop_bit WHERE id = :b").param("b", bitId).update();
  }

  public void setBitJokes(long bitId, List<Long> jokeIds) {
    db.sql("DELETE FROM workshop_bit_joke WHERE bit_id = :b").param("b", bitId).update();
    for (int i = 0; i < jokeIds.size(); i++) {
      db.sql("INSERT INTO workshop_bit_joke (bit_id, joke_id, position) VALUES (:b, :j, :p)")
          .param("b", bitId).param("j", jokeIds.get(i)).param("p", i).update();
    }
  }
}
