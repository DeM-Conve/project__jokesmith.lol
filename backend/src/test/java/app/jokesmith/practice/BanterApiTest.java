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
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class BanterApiTest extends PracticeApiTestBase {
  @Autowired JokeRepository jokes;
  @Autowired PracticeEventRepository events;

  @Test
  void setupListsPersonasTechniquesAndTimers() throws Exception {
    JsonNode s = get(UUID.randomUUID(), "/api/practice/banter/setup");
    assertThat(s.get("personas").findValuesAsText("key")).containsExactly("FRIEND", "COWORKER", "DATE");
    assertThat(s.get("techniques").size()).isEqualTo(9);
    assertThat(s.get("timers").toString()).isEqualTo("[15,10,5]");
  }

  @Test
  void fiveRoundsScoredWithExamplesThenXp() throws Exception {
    UUID me = UUID.randomUUID();
    JsonNode session = post(me, "/api/practice/banter/sessions", Map.of("persona", "FRIEND", "secondsLimit", 10));
    long id = session.get("id").asLong();
    assertThat(session.get("rounds")).hasSize(5);
    assertThat(session.at("/rounds/0/result").isNull()).isTrue();
    assertThat(session.at("/rounds/0/line").asText()).isNotBlank();

    String base = "/api/practice/banter/sessions/" + id + "/rounds/";
    JsonNode r1 = post(me, base + "1/reply", Map.of(
        "reply", "Honestly I love that, but I've aged a thousand years waiting for my own life to sort itself out", "responseMs", 6000));
    JsonNode res = r1.at("/rounds/0/result");
    assertThat(res.get("wit").asInt()).isBetween(1, 5);
    assertThat(res.get("tip").asText()).isNotBlank();
    assertThat(res.at("/example/text").asText()).isNotBlank();
    assertThat(res.at("/example/technique").asText()).isNotBlank();
    assertThat(res.get("moreExamples").size()).isGreaterThanOrEqualTo(2);
    assertThat(res.get("timedOut").asBoolean()).isFalse();

    // can't answer twice
    call(me, MockMvcRequestBuilders.post(base + "1/reply"), Map.of("reply", "again", "responseMs", 100), status().isConflict());

    post(me, base + "2/reply", Map.of("reply", "", "responseMs", 10_000));
    JsonNode r3 = post(me, base + "3/reply", Map.of("reply", "yeah", "responseMs", 2000));
    assertThat(r3.at("/rounds/2/result/saved").asBoolean()).isFalse();
    JsonNode rated = put(me, base + "3/self-rating", Map.of("rating", "BEAT_IT"));
    assertThat(rated.at("/rounds/2/result/selfRating").asText()).isEqualTo("BEAT_IT");
    assertThat(rated.at("/rounds/2/result/saved").asBoolean()).isTrue();

    post(me, base + "4/reply", Map.of("reply", "ok", "responseMs", 1000));
    assertThat(get(me, "/api/practice/banter/sessions/" + id).get("complete").asBoolean()).isFalse();
    JsonNode done = post(me, base + "5/reply", Map.of("reply", "fair enough", "responseMs", 99_000));
    assertThat(done.get("complete").asBoolean()).isTrue();
    assertThat(done.get("xp").asInt()).isBetween(10, 50);
    assertThat(done.at("/rounds/4/result/timedOut").asBoolean()).isTrue();

    assertThat(events.findByUserIdOrderByCreatedAtDesc(me)).extracting(PracticeEvent::getSkill)
        .containsExactly(ComedySkill.REAL_TIME_WIT);
    assertThat(jokes.findByUserIdOrderByCreatedAtDesc(me))
        .allSatisfy(j -> assertThat(j.getSource()).isEqualTo(JokeSource.BANTER))
        .anySatisfy(j -> assertThat(j.getPunchline()).isEqualTo("yeah"));
  }

  @Test
  void rejectsOddTimersAndStrangers() throws Exception {
    UUID me = UUID.randomUUID();
    call(me, MockMvcRequestBuilders.post("/api/practice/banter/sessions"), Map.of("persona", "DATE", "secondsLimit", 7), status().isBadRequest());
    long id = post(me, "/api/practice/banter/sessions", Map.of("persona", "DATE", "secondsLimit", 5)).get("id").asLong();
    call(UUID.randomUUID(), MockMvcRequestBuilders.post("/api/practice/banter/sessions/" + id + "/rounds/1/reply"),
        Map.of("reply", "hi", "responseMs", 100), status().isNotFound());
  }
}
