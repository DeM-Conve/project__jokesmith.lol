package app.punchline.practice;

import app.punchline.PostgresTestBase;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

/** MockMvc helpers for the practice endpoints: each call is made as a given user (pid cookie). */
abstract class PracticeApiTestBase extends PostgresTestBase {
  @Autowired WebApplicationContext ctx;
  @Autowired ObjectMapper json;
  MockMvc mvc;

  @BeforeEach
  void setUpMvc() {
    mvc = MockMvcBuilders.webAppContextSetup(ctx).build();
  }

  JsonNode call(UUID user, MockHttpServletRequestBuilder req, Object body, ResultMatcher status) throws Exception {
    req.cookie(new Cookie("pid", user.toString()));
    if (body != null) req.contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    String out = mvc.perform(req).andExpect(status).andReturn().getResponse().getContentAsString();
    return out.isEmpty() ? null : json.readTree(out);
  }

  JsonNode get(UUID user, String url) throws Exception {
    return call(user, MockMvcRequestBuilders.get(url), null, MockMvcResultMatchers.status().isOk());
  }

  JsonNode post(UUID user, String url, Object body) throws Exception {
    return call(user, MockMvcRequestBuilders.post(url), body, MockMvcResultMatchers.status().isOk());
  }

  JsonNode put(UUID user, String url, Object body) throws Exception {
    return call(user, MockMvcRequestBuilders.put(url), body, MockMvcResultMatchers.status().isOk());
  }
}
