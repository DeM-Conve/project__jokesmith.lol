package app.jokesmith.workshop;

import app.jokesmith.PostgresTestBase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MockMvc helpers for /api/workshop: every call is made as a given user (pid cookie). */
public abstract class WorkshopApiTestBase extends PostgresTestBase {
  @Autowired protected WebApplicationContext ctx;
  @Autowired protected ObjectMapper json;
  protected MockMvc mvc;

  @BeforeEach
  void setUpMvc() {
    mvc = MockMvcBuilders.webAppContextSetup(ctx).build();
  }

  protected JsonNode call(UUID user, MockHttpServletRequestBuilder req, Object body, ResultMatcher expect)
      throws Exception {
    req.cookie(new Cookie("pid", user.toString()));
    if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    String out = mvc.perform(req).andExpect(expect).andReturn().getResponse().getContentAsString();
    return out.isEmpty() ? null : json.readTree(out);
  }

  protected JsonNode get(UUID user, String url) throws Exception {
    return call(user, MockMvcRequestBuilders.get(url), null, status().isOk());
  }

  protected JsonNode post(UUID user, String url, Object body) throws Exception {
    return call(user, MockMvcRequestBuilders.post(url), body, status().is2xxSuccessful());
  }

  protected JsonNode put(UUID user, String url, Object body) throws Exception {
    return call(user, MockMvcRequestBuilders.put(url), body, status().isOk());
  }

  /** A new notebook joke for {@code user}; returns its id. */
  protected long note(UUID user, String setup, String punchline) throws Exception {
    return post(user, "/api/workshop/jokes", Map.of("setup", setup, "punchline", punchline)).get("id").asLong();
  }

  protected long arenaJoke(UUID user, String setup, String punchline) throws Exception {
    long id = note(user, setup, punchline);
    put(user, "/api/workshop/jokes/" + id + "/arena", Map.of("inArena", true));
    return id;
  }
}
