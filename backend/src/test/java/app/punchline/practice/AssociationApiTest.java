package app.punchline.practice;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.punchline.core.ComedySkill;
import app.punchline.core.JokeRepository;
import app.punchline.core.JokeSource;
import app.punchline.core.PracticeEvent;
import app.punchline.core.PracticeEventRepository;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class AssociationApiTest extends PracticeApiTestBase {
  @Autowired JokeRepository jokes;
  @Autowired PracticeEventRepository events;

  private static Map<String, String> item(String category, String text) {
    return Map.of("category", category, "text", text);
  }

  @Test
  void topicsAndCategories() throws Exception {
    JsonNode t = get(UUID.randomUUID(), "/api/practice/associate/topics");
    assertThat(t.get("topics").size()).isGreaterThanOrEqualTo(40);
    assertThat(t.get("categories").findValuesAsText("key")).containsExactly("PEOPLE", "PLACES", "THINGS", "PHRASES", "FEELINGS");
    assertThat(t.get("tips").size()).isGreaterThan(3);
  }

  @Test
  void brainstormThenCollideThenJoke() throws Exception {
    UUID me = UUID.randomUUID();
    JsonNode map = post(me, "/api/practice/associate/sessions", Map.of("topic", "dentist", "items", List.of(
        item("PEOPLE", "my aunt who flosses at weddings"),
        item("PLACES", "a submarine"),
        item("THINGS", "the drill"),
        item("THINGS", "the drill"),
        item("PHRASES", "open wide"),
        item("FEELINGS", "betrayal"),
        item("FEELINGS", "smug relief"))));
    long id = map.get("id").asLong();
    assertThat(map.get("curatedTopic").asText()).isEqualTo("Dentist");
    assertThat(map.get("items")).hasSize(6); // duplicate dropped
    assertThat(map.at("/suggestions/PEOPLE").size()).isBetween(1, 4);
    assertThat(map.get("collisions").size()).isGreaterThanOrEqualTo(2);
    for (JsonNode c : map.get("collisions")) {
      assertThat(c.at("/a/category").asText()).isNotEqualTo(c.at("/b/category").asText());
      assertThat(c.get("surprise").asInt()).isBetween(1, 5);
      assertThat(c.get("prompt").asText()).isNotBlank();
    }

    // adopt a suggestion, reshuffle
    String suggestion = map.at("/suggestions/THINGS/0").asText();
    JsonNode more = post(me, "/api/practice/associate/sessions/" + id + "/items", item("THINGS", suggestion));
    assertThat(more.get("items")).hasSize(7);
    assertThat(get(me, "/api/practice/associate/sessions/" + id + "?shuffle=3").get("collisions").size()).isPositive();

    JsonNode first = post(me, "/api/practice/associate/sessions/" + id + "/jokes",
        Map.of("a", "a submarine", "b", "open wide", "punchline", "My dentist trained on submarines: every check-up he shouts 'dive' and I hold my breath for an hour."));
    assertThat(first.get("xp").asInt()).isEqualTo(25);
    JsonNode second = post(me, "/api/practice/associate/sessions/" + id + "/jokes",
        Map.of("a", "betrayal", "b", "the drill", "setup", "My dentist says it won't hurt.", "punchline", "He's a liar with a drill."));
    assertThat(second.get("xp").asInt()).isZero();
    assertThat(second.get("jokes").asInt()).isEqualTo(2);

    assertThat(jokes.findBySourceAndPromptRef(JokeSource.ASSOCIATION, "assoc:" + id)).hasSize(2)
        .anySatisfy(j -> assertThat(j.getSetup()).isEqualTo("dentist: a submarine × open wide"));
    assertThat(events.findByUserIdOrderByCreatedAtDesc(me)).extracting(PracticeEvent::getSkill)
        .containsExactly(ComedySkill.ASSOCIATION);

    // other users can't see the map
    call(UUID.randomUUID(), MockMvcRequestBuilders.get("/api/practice/associate/sessions/" + id), null, status().isNotFound());
  }

  @Test
  void thinBrainstormOnUnknownTopicStillGetsCollisions() throws Exception {
    JsonNode map = post(UUID.randomUUID(), "/api/practice/associate/sessions",
        Map.of("topic", "zzqx", "items", List.of(item("THINGS", "a rubber duck"))));
    assertThat(map.get("curatedTopic").isNull()).isTrue();
    assertThat(map.get("collisions").size()).isPositive();
    assertThat(map.get("collisions").findValuesAsText("suggested")).contains("true");
  }
}
