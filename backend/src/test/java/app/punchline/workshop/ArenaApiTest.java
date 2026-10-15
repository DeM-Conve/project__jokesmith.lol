package app.punchline.workshop;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.punchline.core.ComedySkill;
import app.punchline.core.JokeSource;
import app.punchline.core.PracticeEventRepository;
import app.punchline.workshop.arena.ArenaRepository.PairKey;
import app.punchline.workshop.arena.ArenaRepository.PoolJoke;
import app.punchline.workshop.arena.ArenaService;
import app.punchline.workshop.arena.ArenaServiceAccess;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

class ArenaApiTest extends WorkshopApiTestBase {
  @Autowired PracticeEventRepository events;

  private Map<String, Object> vote(long l, long r, Long w) {
    Map<String, Object> m = new HashMap<>();
    m.put("leftId", l);
    m.put("rightId", r);
    m.put("winnerId", w);
    return m;
  }

  @Test
  void houseSeedMakesTheArenaWorkForASingleUser() throws Exception {
    UUID solo = UUID.randomUUID();
    JsonNode pair = get(solo, "/api/workshop/arena/pair");
    assertThat(pair.get("left").get("id").asLong()).isPositive();
    assertThat(pair.get("right").get("id").asLong()).isNotEqualTo(pair.get("left").get("id").asLong());
    // Anonymous: no writer, no rating in a duel.
    assertThat(pair.get("left").has("handle")).isFalse();
    assertThat(pair.get("left").has("rating")).isFalse();
  }

  @Test
  void votingMovesEloAndShowsUpInStatsAndLeaderboards() throws Exception {
    UUID alice = UUID.randomUUID(), carol = UUID.randomUUID(), bob = UUID.randomUUID();
    long a = arenaJoke(alice, "My smart fridge tracks my snacking.", "It sent my mum a report.");
    long c = arenaJoke(carol, "My dog greets me like I've come home from war.", "I went to get the mail.");

    JsonNode res = post(bob, "/api/workshop/arena/votes", vote(a, c, a));
    assertThat(res.get("skipped").asBoolean()).isFalse();
    assertThat(res.get("delta").asInt()).isEqualTo(16);
    assertThat(res.get("left").get("before").asInt()).isEqualTo(1200);
    assertThat(res.get("left").get("after").asInt()).isEqualTo(1216);
    assertThat(res.get("right").get("after").asInt()).isEqualTo(1184);
    assertThat(res.get("votesCast").asInt()).isEqualTo(1);
    assertThat(res.get("nextXpIn").asInt()).isEqualTo(9);

    // One vote per voter per pair, in either order.
    call(bob, MockMvcRequestBuilders.post("/api/workshop/arena/votes"), vote(c, a, c), status().isConflict());
    // But another voter can judge it: the upset (loser now lower rated) moves more points.
    JsonNode up = post(UUID.randomUUID(), "/api/workshop/arena/votes", vote(a, c, c));
    assertThat(up.get("delta").asInt()).isGreaterThan(16);

    JsonNode mine = get(alice, "/api/workshop/arena/mine");
    JsonNode mj = find(mine.get("jokes"), a);
    assertThat(mj.get("votes").asInt()).isEqualTo(2);
    assertThat(mj.get("wins").asInt()).isEqualTo(1);
    assertThat(mj.get("winRate").asInt()).isEqualTo(50);
    assertThat(mj.get("inArena").asBoolean()).isTrue();
    assertThat(mine.get("writerRating").isNull()).isFalse();

    // Leaderboards are top-20 over a shared database, so assert rank consistency rather than membership:
    // our joke is listed, or the list is full of jokes that rank at least as high.
    double cGain = -16 + up.get("delta").asDouble();
    if (cGain > 0) assertRanked(get(bob, "/api/workshop/arena/leaderboard?period=WEEK").get("jokes"), c, "gained", cGain);
    int aRating = 1216 - up.get("delta").asInt();
    JsonNode all = get(alice, "/api/workshop/arena/leaderboard?period=ALL").get("jokes");
    assertRanked(all, a, "rating", aRating);
    for (JsonNode j : all) assertThat(j.get("mine").asBoolean()).isEqualTo(j.get("jokeId").asLong() == a);
  }

  private static void assertRanked(JsonNode list, long id, String field, double value) {
    double prev = Double.MAX_VALUE;
    int rank = 0;
    for (JsonNode j : list) {
      assertThat(j.get("rank").asInt()).isEqualTo(++rank);
      assertThat(j.get(field).asDouble()).isLessThanOrEqualTo(prev);
      prev = j.get(field).asDouble();
      if (j.get("jokeId").asLong() == id) {
        assertThat(j.get(field).asDouble()).isCloseTo(value, org.assertj.core.api.Assertions.within(1.0));
        return;
      }
    }
    assertThat(list.size()).as("joke %d missing from a list that isn't full", id).isEqualTo(20);
    assertThat(prev).isGreaterThanOrEqualTo(value - 1);
  }

  @Test
  void rejectsOwnJokesSelfDuelsBadWinnersAndPrivateDrafts() throws Exception {
    UUID alice = UUID.randomUUID(), bob = UUID.randomUUID();
    long mine = arenaJoke(alice, "I joined a gym in January.", "So far I've lost forty dollars a month.");
    long theirs = arenaJoke(bob, "I set eight alarms.", "So I can win seven times before I lose.");
    long draft = note(bob, "A private draft", "Not in the arena yet.");
    var post = MockMvcRequestBuilders.post("/api/workshop/arena/votes");
    call(alice, post, vote(mine, theirs, mine), status().isBadRequest());
    call(UUID.randomUUID(), MockMvcRequestBuilders.post("/api/workshop/arena/votes"), vote(theirs, theirs, theirs), status().isBadRequest());
    call(UUID.randomUUID(), MockMvcRequestBuilders.post("/api/workshop/arena/votes"), vote(mine, theirs, 999_999L), status().isBadRequest());
    call(UUID.randomUUID(), MockMvcRequestBuilders.post("/api/workshop/arena/votes"), vote(mine, draft, mine), status().isConflict());
    call(UUID.randomUUID(), MockMvcRequestBuilders.post("/api/workshop/arena/votes"), vote(mine, 999_999_999L, mine), status().isNotFound());
  }

  @Test
  void pairsNeverShowOwnJokesNorRepeatJudgedPairs() throws Exception {
    UUID me = UUID.randomUUID();
    Set<Long> own = new HashSet<>();
    for (int i = 0; i < 3; i++) own.add(arenaJoke(me, "My own setup " + i, "My own punchline " + i));
    Set<String> seen = new HashSet<>();
    for (int i = 0; i < 25; i++) {
      JsonNode p = get(me, "/api/workshop/arena/pair");
      long l = p.get("left").get("id").asLong(), r = p.get("right").get("id").asLong();
      assertThat(own).doesNotContain(l, r);
      String key = Math.min(l, r) + "-" + Math.max(l, r);
      assertThat(seen.add(key)).as("repeat pair " + key).isTrue();
      post(me, "/api/workshop/arena/votes", vote(l, r, i % 5 == 4 ? null : l));
    }
    // 20 picks (5 skips) = 2 FEEDBACK rewards.
    JsonNode pair = get(me, "/api/workshop/arena/pair");
    assertThat(pair.get("votesCast").asInt()).isEqualTo(20);
    assertThat(events.findByUserIdOrderByCreatedAtDesc(me)).filteredOn(e -> e.getSkill() == ComedySkill.FEEDBACK)
        .hasSize(2).allMatch(e -> e.getXp() == 10);
  }

  @Test
  void samePromptDuelsShareSourceAndPromptRef() throws Exception {
    UUID me = UUID.randomUUID();
    for (int i = 0; i < 5; i++) {
      JsonNode p = get(me, "/api/workshop/arena/pair?samePrompt=true");
      assertThat(p.get("samePrompt").asBoolean()).isTrue();
      assertThat(p.get("promptLabel").asText()).isNotBlank();
      long l = p.get("left").get("id").asLong(), r = p.get("right").get("id").asLong();
      assertThat(promptOf(l)).isEqualTo(promptOf(r)).isNotNull();
      post(me, "/api/workshop/arena/votes", vote(l, r, r));
    }
  }

  @Autowired org.springframework.jdbc.core.simple.JdbcClient db;

  private String promptOf(long id) {
    return db.sql("SELECT source || '|' || prompt_ref FROM joke WHERE id = :id").param("id", id).query(String.class).single();
  }

  @Test
  void pairSelectionRules() {
    UUID w1 = UUID.randomUUID(), w2 = UUID.randomUUID();
    List<PoolJoke> pool = new ArrayList<>();
    pool.add(new PoolJoke(1, w1, "", "a", JokeSource.DAILY_RIFF, "d1", 1200, 0));
    pool.add(new PoolJoke(2, w2, "", "b", JokeSource.DAILY_RIFF, "d1", 1200, 0));
    pool.add(new PoolJoke(3, w2, "", "c", JokeSource.DAILY_RIFF, "d2", 1200, 0));
    pool.add(new PoolJoke(4, w1, "", "d", JokeSource.BANTER, null, 1200, 0));

    // Same prompt: only 1 vs 2 is possible.
    PoolJoke[] p = ArenaServiceAccess.choose(pool, Set.of(), true);
    assertThat(Set.of(p[0].id(), p[1].id())).containsExactlyInAnyOrder(1L, 2L);
    // Once judged, the same-prompt pool is exhausted.
    assertThat(ArenaServiceAccess.choose(pool, Set.of(PairKey.of(2, 1)), true)).isNull();

    // Open pool: every unjudged pair is reachable, judged ones never come back.
    Set<PairKey> voted = new HashSet<>(Set.of(PairKey.of(1, 2), PairKey.of(1, 3), PairKey.of(1, 4), PairKey.of(2, 3)));
    for (int i = 0; i < 30; i++) {
      PoolJoke[] q = ArenaServiceAccess.choose(pool, voted, false);
      assertThat(PairKey.of(q[0].id(), q[1].id())).isIn(PairKey.of(2, 4), PairKey.of(3, 4));
    }
    voted.add(PairKey.of(2, 4));
    voted.add(PairKey.of(3, 4));
    assertThat(ArenaServiceAccess.choose(pool, voted, false)).isNull();

    // Prefers the least-duelled joke as the anchor, matched to the closest rating.
    List<PoolJoke> rated = List.of(
        new PoolJoke(10, w1, "", "new", JokeSource.DAILY_RIFF, null, 1200, 0),
        new PoolJoke(11, w2, "", "close", JokeSource.DAILY_RIFF, null, 1210, 30),
        new PoolJoke(12, w2, "", "far", JokeSource.DAILY_RIFF, null, 1700, 30));
    for (int i = 0; i < 20; i++) {
      PoolJoke[] q = ArenaServiceAccess.choose(rated, Set.of(), false);
      assertThat(Set.of(q[0].id(), q[1].id())).containsExactlyInAnyOrder(10L, 11L);
    }
    assertThat(ArenaService.class).isNotNull();
  }

  private static JsonNode find(JsonNode arr, long id) {
    for (JsonNode n : arr) if (n.get("jokeId").asLong() == id) return n;
    throw new AssertionError("joke " + id + " not in " + arr);
  }
}
