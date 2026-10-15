package app.jokesmith.practice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.jokesmith.core.ComedySkill;
import app.jokesmith.core.JokeRepository;
import app.jokesmith.core.JokeSource;
import app.jokesmith.core.PracticeEvent;
import app.jokesmith.core.PracticeEventRepository;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class RiffApiTest extends PracticeApiTestBase {
  @Autowired JokeRepository jokes;
  @Autowired PracticeEventRepository events;

  private static final String TODAY = LocalDate.now().toString();
  private static final String BASE = "/api/practice/riff/days/";

  @Test
  void everyoneGetsTheSameSetupAndModelPunchlinesWaitUntilYouRiff() throws Exception {
    JsonNode a = get(UUID.randomUUID(), BASE + TODAY);
    JsonNode b = get(UUID.randomUUID(), BASE + TODAY);
    assertThat(a.get("setup").asText()).isNotBlank().isEqualTo(b.get("setup").asText());
    assertThat(a.get("number").asLong()).isGreaterThan(200);
    assertThat(a.get("sessions").asInt()).isZero();
    assertThat(a.get("modelPunchlines").isNull()).isTrue();
  }

  @Test
  void submittingSavesJokesRecordsXpAndRevealsModels() throws Exception {
    UUID me = UUID.randomUUID();
    List<String> lines = IntStream.rangeClosed(1, 11).mapToObj(i -> "punchline " + i).toList();
    JsonNode res = post(me, BASE + TODAY, Map.of("punchlines", lines, "secondsUsed", 290));
    assertThat(res.get("saved").asInt()).isEqualTo(11);
    assertThat(res.get("xp").asInt()).isEqualTo(50);
    assertThat(res.get("skill").asText()).isEqualTo("HEIGHTENING");
    assertThat(res.at("/day/punchlines")).hasSize(11);
    assertThat(res.at("/day/modelPunchlines").size()).isBetween(3, 5);

    assertThat(jokes.findBySourceAndPromptRef(JokeSource.DAILY_RIFF, TODAY))
        .filteredOn(j -> j.getUserId().equals(me)).hasSize(11)
        .allSatisfy(j -> assertThat(j.getSetup()).isEqualTo(res.at("/day/setup").asText()));
    assertThat(events.findByUserIdOrderByCreatedAtDesc(me)).extracting(PracticeEvent::getSkill, PracticeEvent::getXp)
        .containsExactly(org.assertj.core.groups.Tuple.tuple(ComedySkill.HEIGHTENING, 50));

    JsonNode small = post(me, BASE + TODAY, Map.of("punchlines", List.of("one", " ", "two"), "secondsUsed", 300));
    assertThat(small.get("xp").asInt()).isEqualTo(10);
    assertThat(small.get("skill").asText()).isEqualTo("REAL_TIME_WIT");
    assertThat(small.at("/day/sessions").asInt()).isEqualTo(2);
  }

  @Test
  void bestPicksAreSharedByHandle() throws Exception {
    UUID me = UUID.randomUUID();
    UUID other = UUID.randomUUID();
    put(other, "/api/me", Map.of("handle", "RivalGoose"));
    JsonNode mine = post(me, BASE + TODAY, Map.of("punchlines", List.of("my weak one", "my great one"), "secondsUsed", 120));
    JsonNode theirs = post(other, BASE + TODAY, Map.of("punchlines", List.of("their gem"), "secondsUsed", 60));
    long myBest = mine.at("/day/punchlines/1/id").asLong();
    long theirBest = theirs.at("/day/punchlines/0/id").asLong();

    JsonNode day = put(me, BASE + TODAY + "/best", Map.of("jokeId", myBest));
    assertThat(day.get("bestJokeId").asLong()).isEqualTo(myBest);
    put(other, BASE + TODAY + "/best", Map.of("jokeId", theirBest));

    JsonNode picks = get(me, BASE + TODAY + "/picks");
    assertThat(picks.findValuesAsText("punchline")).contains("my great one", "their gem");
    for (JsonNode p : picks) {
      if (p.get("punchline").asText().equals("their gem")) {
        assertThat(p.get("handle").asText()).isEqualTo("RivalGoose");
        assertThat(p.get("mine").asBoolean()).isFalse();
      }
      if (p.get("punchline").asText().equals("my great one")) assertThat(p.get("mine").asBoolean()).isTrue();
    }

    // can't pick someone else's punchline
    call(me, MockMvcRequestBuilders.put(BASE + TODAY + "/best"), Map.of("jokeId", theirBest), status().isBadRequest());
  }

  @Test
  void archiveListsPastDaysAndOutOfRangeDatesAre404() throws Exception {
    UUID me = UUID.randomUUID();
    String yesterday = LocalDate.now().minusDays(1).toString();
    post(me, BASE + yesterday, Map.of("punchlines", List.of("late but here"), "secondsUsed", 30));
    JsonNode archive = get(me, "/api/practice/riff/archive?today=" + TODAY + "&limit=7");
    assertThat(archive).hasSize(7);
    assertThat(archive.get(0).get("date").asText()).isEqualTo(yesterday);
    assertThat(archive.get(0).get("riffed").asBoolean()).isTrue();
    assertThat(archive.get(1).get("riffed").asBoolean()).isFalse();

    call(me, MockMvcRequestBuilders.get(BASE + LocalDate.now().plusDays(5)), null, status().isNotFound());
    call(me, MockMvcRequestBuilders.get(BASE + "2025-06-01"), null, status().isNotFound());
    call(me, MockMvcRequestBuilders.post(BASE + TODAY), Map.of("punchlines", List.of(), "secondsUsed", 10), status().isBadRequest());
  }
}
