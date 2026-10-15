package app.jokesmith.workshop;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.jokesmith.core.ComedySkill;
import app.jokesmith.core.JokeRepository;
import app.jokesmith.core.JokeSource;
import app.jokesmith.core.PracticeEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

class PunchUpApiTest extends WorkshopApiTestBase {
  @Autowired JokeRepository jokes;
  @Autowired PracticeEventRepository events;

  @Test
  void socraticLoopSavesEveryVersionAndUnlocksMovesAfterARewrite() throws Exception {
    UUID me = UUID.randomUUID();
    JsonNode s = post(me, "/api/workshop/punchup",
        Map.of("setup", "I asked my speaker to play something really relaxing.", "punchline", "And then it just turned off the news for me."));
    long id = s.get("id").asLong();
    assertThat(s.get("stage").asText()).isEqualTo("DIAGNOSED");
    assertThat(s.get("versions")).hasSize(1);
    JsonNode flags = s.get("versions").get(0).get("analysis").get("flags");
    assertThat(flags.findValuesAsText("fix")).contains("CUT_FILLER", "END_ON_PUNCH");
    assertThat(flags.get(0).get("question").asText()).endsWith("?");
    assertThat(flags.get(0).get("example").get("after").get("punchline").asText()).isNotBlank();
    assertThat(s.get("critique").isNull()).isTrue();

    // Socratic: no moves until the user has tried.
    call(me, MockMvcRequestBuilders.get("/api/workshop/punchup/" + id + "/moves"), null, status().isConflict());
    // A rewrite has to change something.
    call(me, MockMvcRequestBuilders.post("/api/workshop/punchup/" + id + "/rewrites"),
        Map.of("setup", "I asked my speaker to play something really relaxing.", "punchline", "And then it just turned off the news for me. "),
        status().isBadRequest());

    JsonNode r = post(me, "/api/workshop/punchup/" + id + "/rewrites",
        Map.of("setup", "I asked my speaker to play something relaxing.", "punchline", "It turned off the news."));
    assertThat(r.get("stage").asText()).isEqualTo("REWRITTEN");
    assertThat(r.get("versions")).hasSize(2);
    JsonNode c = r.get("critique");
    assertThat(c.get("wordsAfter").asInt()).isLessThan(c.get("wordsBefore").asInt());
    assertThat(c.get("fixed").toString()).contains("END_ON_PUNCH");
    assertThat(c.get("diff").toString()).contains("REMOVED");

    JsonNode moves = get(me, "/api/workshop/punchup/" + id + "/moves");
    assertThat(moves.get("moves").size()).isPositive();

    post(me, "/api/workshop/punchup/" + id + "/rewrites",
        Map.of("setup", "I asked my speaker for something relaxing.", "punchline", "It turned off the news."));
    // Every version is in the joke bank as PUNCH_UP; xp only once per session.
    assertThat(jokes.findByUserIdOrderByCreatedAtDesc(me)).hasSize(3).allMatch(j -> j.getSource() == JokeSource.PUNCH_UP);
    assertThat(events.findByUserIdOrderByCreatedAtDesc(me)).hasSize(1)
        .allMatch(e -> e.getSkill() == ComedySkill.ECONOMY && e.getXp() == 25);

    JsonNode sent = post(me, "/api/workshop/punchup/" + id + "/arena", null);
    assertThat(sent.get("latestInArena").asBoolean()).isTrue();
    assertThat(get(me, "/api/workshop/punchup")).hasSize(1);
  }

  @Test
  void startsFromANotebookJokeAndHidesOtherUsersSessions() throws Exception {
    UUID me = UUID.randomUUID(), other = UUID.randomUUID();
    long joke = note(me, "I joined a gym in January.", "Forty dollars a month is what I've lost so far.");
    JsonNode s = post(me, "/api/workshop/punchup", Map.of("fromJokeId", joke));
    assertThat(s.get("originJokeId").asLong()).isEqualTo(joke);
    assertThat(s.get("versions").get(0).get("jokeId").asLong()).isEqualTo(joke);
    assertThat(s.get("versions").get(0).get("analysis").get("flags").findValuesAsText("fix")).contains("MOVE_PUNCH_LAST");
    long id = s.get("id").asLong();

    call(other, MockMvcRequestBuilders.get("/api/workshop/punchup/" + id), null, status().isNotFound());
    call(other, MockMvcRequestBuilders.post("/api/workshop/punchup/" + id + "/rewrites"), Map.of("punchline", "x"), status().isNotFound());
    call(other, MockMvcRequestBuilders.post("/api/workshop/punchup"), Map.of("fromJokeId", joke), status().isNotFound());
    call(me, MockMvcRequestBuilders.post("/api/workshop/punchup"), Map.of("setup", "only setup"), status().isBadRequest());
  }

  @Test
  void statelessAnalyseAndExampleLibrary() throws Exception {
    UUID me = UUID.randomUUID();
    JsonNode a = post(me, "/api/workshop/punchup/analyse", Map.of("setup", "", "punchline", "Some guy did a thing with stuff."));
    assertThat(a.get("flags").findValuesAsText("fix")).contains("GET_SPECIFIC");
    assertThat(get(me, "/api/workshop/punchup/examples").size()).isGreaterThanOrEqualTo(30);
    assertThat(jokes.findByUserIdOrderByCreatedAtDesc(me)).isEmpty();
  }
}
