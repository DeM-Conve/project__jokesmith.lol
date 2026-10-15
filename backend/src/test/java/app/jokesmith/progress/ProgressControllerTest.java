package app.jokesmith.progress;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.jokesmith.PostgresTestBase;
import app.jokesmith.core.ComedySkill;
import app.jokesmith.core.JokeBank;
import app.jokesmith.core.JokeSource;
import app.jokesmith.core.PracticeEvent;
import app.jokesmith.core.PracticeEventRepository;
import app.jokesmith.user.UserService;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

/** MockMvc built from the shared context (no extra context just for MockMvc). */
class ProgressControllerTest extends PostgresTestBase {
  @Autowired WebApplicationContext web;
  MockMvc mvc;
  @Autowired UserService users;
  @Autowired JokeBank bank;
  @Autowired PracticeEventRepository events;
  @Autowired JdbcTemplate jdbc;

  UUID user;
  Cookie pid;

  @BeforeEach
  void setUp() {
    mvc = MockMvcBuilders.webAppContextSetup(web).build();
    user = UUID.randomUUID();
    users.getOrCreate(user);
    pid = new Cookie("pid", user.toString());
  }

  static String take(String jokePart) {
    return """
        {%s, "transcript": "my dog is so lazy he hired a cat",
         "durationMs": 4200, "speechMs": 3100, "wordCount": 9, "wordsPerMinute": 174.2,
         "prePunchPauseMs": 640, "longestPauseMs": 640, "fillerCount": 1, "punchLast": true,
         "energyVariance": 0.42, "score": 81}
        """.formatted(jokePart);
  }

  @Test
  void todayAndRadarRespond() throws Exception {
    mvc.perform(get("/api/progress/today").param("tz", "Asia/Kolkata").cookie(pid))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.newUser").value(true))
        .andExpect(jsonPath("$.plan[0].route").value("/riff"))
        .andExpect(jsonPath("$.dailyGoal").value(ProgressService.DAILY_GOAL));
    mvc.perform(get("/api/progress/radar").param("tz", "garbage").cookie(pid))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.skills.length()").value(9))
        .andExpect(jsonPath("$.rank.ranks").value(9))
        .andExpect(jsonPath("$.ladder[0].title").value("Open-Mic Newbie"))
        .andExpect(jsonPath("$.ladder[8].title").value("Headliner"));
  }

  @Test
  void savingATakeWithBankJokeRecordsDeliveryXp() throws Exception {
    long jokeId = bank.save(user, "My dog is so lazy", "he hired a cat.", JokeSource.NOTEBOOK, null).getId();
    mvc.perform(get("/api/progress/delivery/jokes").cookie(pid))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(jokeId))
        .andExpect(jsonPath("$[0].punchline").value("he hired a cat."));

    mvc.perform(post("/api/progress/delivery/takes").cookie(pid).contentType(MediaType.APPLICATION_JSON)
            .content(take("\"jokeId\": " + jokeId)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.xp").value(25))
        .andExpect(jsonPath("$.totalTakes").value(1))
        .andExpect(jsonPath("$.take.jokeText").value("My dog is so lazy he hired a cat."))
        .andExpect(jsonPath("$.take.prePunchPauseMs").value(640))
        .andExpect(jsonPath("$.take.punchLast").value(true));

    assertThat(events.findByUserIdOrderByCreatedAtDesc(user))
        .extracting(PracticeEvent::getSkill, PracticeEvent::getXp)
        .containsExactly(org.assertj.core.groups.Tuple.tuple(ComedySkill.DELIVERY, 25));
    mvc.perform(get("/api/progress/delivery/takes").cookie(pid))
        .andExpect(jsonPath("$.length()").value(1))
        .andExpect(jsonPath("$[0].score").value(81));
  }

  @Test
  void typedJokeIsBankedAsDeliveryOnce() throws Exception {
    mvc.perform(post("/api/progress/delivery/takes").cookie(pid).contentType(MediaType.APPLICATION_JSON)
            .content(take("\"setup\": \"My dog is so lazy\", \"punchline\": \"he hired a cat.\"")))
        .andExpect(status().isCreated());
    Integer banked = jdbc.queryForObject(
        "SELECT count(*) FROM joke WHERE user_id = ? AND source = 'DELIVERY'", Integer.class, user);
    assertThat(banked).isEqualTo(1);
  }

  @Test
  void rejectsBadTakes() throws Exception {
    // no joke at all
    mvc.perform(post("/api/progress/delivery/takes").cookie(pid).contentType(MediaType.APPLICATION_JSON)
            .content(take("\"punchline\": \"  \"")))
        .andExpect(status().isBadRequest());
    // somebody else's joke
    UUID other = UUID.randomUUID();
    users.getOrCreate(other);
    long theirs = bank.save(other, "", "not yours", JokeSource.NOTEBOOK, null).getId();
    mvc.perform(post("/api/progress/delivery/takes").cookie(pid).contentType(MediaType.APPLICATION_JSON)
            .content(take("\"jokeId\": " + theirs)))
        .andExpect(status().isNotFound());
    // out-of-range metric
    mvc.perform(post("/api/progress/delivery/takes").cookie(pid).contentType(MediaType.APPLICATION_JSON)
            .content(take("\"jokeId\": " + theirs).replace("\"score\": 81", "\"score\": 400")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.status").value(400));
    assertThat(events.findByUserIdOrderByCreatedAtDesc(user)).isEmpty();
  }
}
