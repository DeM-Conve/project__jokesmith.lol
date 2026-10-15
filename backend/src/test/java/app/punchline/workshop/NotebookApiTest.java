package app.punchline.workshop;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.punchline.core.JokeBank;
import app.punchline.core.JokeSource;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

class NotebookApiTest extends WorkshopApiTestBase {
  @Autowired JokeBank bank;

  @Test
  void crudFiltersTagsAndFavourites() throws Exception {
    UUID me = UUID.randomUUID();
    JsonNode created = post(me, "/api/workshop/jokes",
        Map.of("setup", "My cat has a forty-dollar bed.", "punchline", "She sleeps in the box.", "tags", List.of("pets", "#Home ", "PETS")));
    long id = created.get("id").asLong();
    assertThat(created.get("source").asText()).isEqualTo("NOTEBOOK");
    assertThat(created.get("tags")).hasSize(2);
    assertThat(created.get("inArena").asBoolean()).isFalse();
    bank.save(me, "Daily riff setup", "A riff about airports.", JokeSource.DAILY_RIFF, "2026-10-15");

    assertThat(get(me, "/api/workshop/jokes")).hasSize(2);
    assertThat(get(me, "/api/workshop/jokes?source=DAILY_RIFF")).hasSize(1);
    assertThat(get(me, "/api/workshop/jokes?q=BOX")).hasSize(1);
    assertThat(get(me, "/api/workshop/jokes?tag=home")).hasSize(1);
    assertThat(get(me, "/api/workshop/jokes?favourite=true")).isEmpty();
    // A riff is in the arena by default; a notebook draft is private until sent.
    JsonNode riff = get(me, "/api/workshop/jokes?source=DAILY_RIFF").get(0);
    assertThat(riff.get("inArena").asBoolean()).isTrue();

    put(me, "/api/workshop/jokes/" + id + "/favourite", Map.of("favourite", true));
    assertThat(get(me, "/api/workshop/jokes?favourite=true")).hasSize(1);

    JsonNode edited = put(me, "/api/workshop/jokes/" + id,
        Map.of("setup", "My cat has a forty-dollar bed.", "punchline", "She sleeps in the box it came in."));
    assertThat(edited.get("punchline").asText()).endsWith("came in.");
    assertThat(edited.get("tags")).hasSize(2); // tags untouched when omitted

    put(me, "/api/workshop/jokes/" + id + "/tags", Map.of("tags", List.of("closer")));
    assertThat(get(me, "/api/workshop/tags").findValuesAsText("name")).containsExactly("closer");

    JsonNode sent = put(me, "/api/workshop/jokes/" + id + "/arena", Map.of("inArena", true));
    assertThat(sent.get("inArena").asBoolean()).isTrue();

    call(me, MockMvcRequestBuilders.delete("/api/workshop/jokes/" + id), null, status().isNoContent());
    assertThat(get(me, "/api/workshop/jokes")).hasSize(1);
    assertThat(get(me, "/api/workshop/tags")).isEmpty();
  }

  @Test
  void validation() throws Exception {
    UUID me = UUID.randomUUID();
    call(me, MockMvcRequestBuilders.post("/api/workshop/jokes"), Map.of("setup", "x", "punchline", " "), status().isBadRequest());
    call(me, MockMvcRequestBuilders.post("/api/workshop/jokes"),
        Map.of("punchline", "p", "tags", List.of("a", "b", "c", "d", "e", "f", "g", "h", "i")), status().isBadRequest());
  }

  @Test
  void cannotTouchSomeoneElsesJokesOrBits() throws Exception {
    UUID alice = UUID.randomUUID(), mallory = UUID.randomUUID();
    long id = note(alice, "Alice's setup", "Alice's punchline");
    long bit = post(alice, "/api/workshop/bits", Map.of("title", "Alice bit", "jokeIds", List.of(id))).get("id").asLong();

    var notFound = status().isNotFound();
    call(mallory, MockMvcRequestBuilders.put("/api/workshop/jokes/" + id), Map.of("punchline", "pwned"), notFound);
    call(mallory, MockMvcRequestBuilders.delete("/api/workshop/jokes/" + id), null, notFound);
    call(mallory, MockMvcRequestBuilders.put("/api/workshop/jokes/" + id + "/favourite"), Map.of("favourite", true), notFound);
    call(mallory, MockMvcRequestBuilders.put("/api/workshop/jokes/" + id + "/tags"), Map.of("tags", List.of("x")), notFound);
    call(mallory, MockMvcRequestBuilders.put("/api/workshop/jokes/" + id + "/arena"), Map.of("inArena", true), notFound);
    call(mallory, MockMvcRequestBuilders.get("/api/workshop/callbacks?jokeId=" + id), null, notFound);
    call(mallory, MockMvcRequestBuilders.put("/api/workshop/bits/" + bit), Map.of("title", "mine now"), notFound);
    call(mallory, MockMvcRequestBuilders.delete("/api/workshop/bits/" + bit), null, notFound);
    long mbit = post(mallory, "/api/workshop/bits", Map.of("title", "Mallory bit")).get("id").asLong();
    call(mallory, MockMvcRequestBuilders.put("/api/workshop/bits/" + mbit + "/jokes"), Map.of("jokeIds", List.of(id)), notFound);

    assertThat(get(mallory, "/api/workshop/jokes")).isEmpty();
    JsonNode still = get(alice, "/api/workshop/jokes").get(0);
    assertThat(still.get("punchline").asText()).isEqualTo("Alice's punchline");
    assertThat(still.get("favourite").asBoolean()).isFalse();
    assertThat(get(alice, "/api/workshop/bits").get(0).get("title").asText()).isEqualTo("Alice bit");
  }

  @Test
  void bitsKeepTheirOrder() throws Exception {
    UUID me = UUID.randomUUID();
    long a = note(me, "A", "first"), b = note(me, "B", "second"), c = note(me, "C", "third");
    JsonNode bit = post(me, "/api/workshop/bits", Map.of("title", "Airports", "jokeIds", List.of(a, b, c)));
    long id = bit.get("id").asLong();
    assertThat(bit.get("jokes").findValuesAsText("punchline")).containsExactly("first", "second", "third");

    JsonNode reordered = put(me, "/api/workshop/bits/" + id + "/jokes", Map.of("jokeIds", List.of(c, a)));
    assertThat(reordered.get("jokes").findValuesAsText("punchline")).containsExactly("third", "first");
    call(me, MockMvcRequestBuilders.put("/api/workshop/bits/" + id + "/jokes"), Map.of("jokeIds", List.of(a, a)), status().isBadRequest());

    assertThat(put(me, "/api/workshop/bits/" + id, Map.of("title", "Airport bit")).get("title").asText()).isEqualTo("Airport bit");
    // Deleting a joke drops it from its bit.
    call(me, MockMvcRequestBuilders.delete("/api/workshop/jokes/" + c), null, status().isNoContent());
    assertThat(get(me, "/api/workshop/bits").get(0).get("jokes")).hasSize(1);
    call(me, MockMvcRequestBuilders.delete("/api/workshop/bits/" + id), null, status().isNoContent());
    assertThat(get(me, "/api/workshop/bits")).isEmpty();
  }

  @Test
  void callbackFinderMatchesSharedNouns() throws Exception {
    UUID me = UUID.randomUUID();
    long fridge = note(me, "I bought a smart fridge.", "It judges me every time I open it.");
    long fridges = note(me, "My mom has two fridges.", "One is just for her plastic bags.");
    long bags = note(me, "I keep a bag of bags.", "It's not storage, it's a nesting doll.");
    note(me, "I joined a gym.", "So far I've lost forty dollars a month.");

    JsonNode forFridge = get(me, "/api/workshop/callbacks?jokeId=" + fridge);
    assertThat(forFridge).hasSize(1);
    assertThat(forFridge.get(0).get("b").get("id").asLong()).isEqualTo(fridges);
    assertThat(forFridge.get(0).get("sharedWords").get(0).asText()).isEqualTo("fridge");
    assertThat(forFridge.get(0).get("hint").asText()).contains("fridge");

    JsonNode all = get(me, "/api/workshop/callbacks");
    assertThat(all).hasSize(2);
    assertThat(all.findValues("sharedWords").stream().map(JsonNode::toString).toList())
        .anyMatch(s -> s.contains("bag"));
    assertThat(bags).isPositive();
  }
}
