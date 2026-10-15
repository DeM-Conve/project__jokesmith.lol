package app.jokesmith.learn;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.jokesmith.PostgresTestBase;
import app.jokesmith.core.*;
import jakarta.servlet.http.Cookie;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

class LearnApiTest extends PostgresTestBase {
  @Autowired WebApplicationContext ctx;
  @Autowired JokeRepository jokes;
  @Autowired PracticeEventRepository events;
  @Autowired GymAttemptRepository gymAttempts;
  @Autowired XRayRunRepository xrayRuns;

  MockMvc mvc;
  UUID user;
  Cookie pid;

  @BeforeEach
  void setUp() {
    mvc = MockMvcBuilders.webAppContextSetup(ctx).build();
    user = UUID.randomUUID();
    pid = new Cookie("pid", user.toString());
  }

  private MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder b, String body) {
    return b.cookie(pid).contentType(MediaType.APPLICATION_JSON).content(body);
  }

  private int xp(ComedySkill skill) {
    return events.findByUserIdOrderByCreatedAtDesc(user).stream().filter(e -> e.getSkill() == skill)
        .mapToInt(PracticeEvent::getXp).sum();
  }

  @Test
  void completingALessonSavesTheJokeAndAwardsXpOnce() throws Exception {
    mvc.perform(get("/api/learn/progress").cookie(pid)).andExpect(status().isOk())
        .andExpect(jsonPath("$.completedCount").value(0))
        .andExpect(jsonPath("$.totalLessons").value(9));

    String body = """
        {"quizCorrect": 3, "quizTotal": 4, "setup": "I've been going to the gym religiously.",
         "punchline": "Christmas and Easter.", "formula": "MISDIRECTION"}""";
    mvc.perform(json(post("/api/learn/lessons/ANATOMY/complete"), body)).andExpect(status().isOk())
        .andExpect(jsonPath("$.firstCompletion").value(true))
        .andExpect(jsonPath("$.xpAwarded").value(50))
        .andExpect(jsonPath("$.status.bestQuizCorrect").value(3))
        .andExpect(jsonPath("$.checks[?(@.key=='punch-last')].passed").value(true));

    mvc.perform(json(post("/api/learn/lessons/ANATOMY/complete"), """
        {"quizCorrect": 4, "quizTotal": 4}""")).andExpect(status().isOk())
        .andExpect(jsonPath("$.firstCompletion").value(false))
        .andExpect(jsonPath("$.xpAwarded").value(0))
        .andExpect(jsonPath("$.status.bestQuizCorrect").value(4))
        .andExpect(jsonPath("$.status.timesCompleted").value(2));

    assertThat(xp(ComedySkill.ANATOMY)).isEqualTo(50);
    assertThat(jokes.findByUserIdOrderByCreatedAtDesc(user)).singleElement()
        .satisfies(j -> assertThat(j.getPromptRef()).isEqualTo("lesson:ANATOMY"));
    mvc.perform(get("/api/learn/progress").cookie(pid))
        .andExpect(jsonPath("$.completedCount").value(1))
        .andExpect(jsonPath("$.lessons[0].skill").value("ANATOMY"));
  }

  @Test
  void lessonValidation() throws Exception {
    mvc.perform(json(post("/api/learn/lessons/ANATOMY/complete"), """
        {"quizCorrect": 5, "quizTotal": 4}""")).andExpect(status().isBadRequest());
    mvc.perform(json(post("/api/learn/lessons/NOT_A_SKILL/complete"), """
        {"quizCorrect": 1, "quizTotal": 4}""")).andExpect(status().isBadRequest());
  }

  @Test
  void xrayAnalysesOfflineAndRecordsXp() throws Exception {
    mvc.perform(json(post("/api/learn/xray"), """
        {"text": "My smart speaker is like a teenager. It only listens when I'm saying something private."}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.setup").value("My smart speaker is like a teenager."))
        .andExpect(jsonPath("$.punchWord").value("private"))
        .andExpect(jsonPath("$.formula").value("COMPARISON"))
        .andExpect(jsonPath("$.source").value("ESTIMATE"));
    assertThat(xp(ComedySkill.ANATOMY)).isEqualTo(10);
    assertThat(xrayRuns.findTop10ByUserIdOrderByCreatedAtDesc(user)).singleElement()
        .satisfies(r -> assertThat(r.getMode()).isEqualTo(XRayMode.AUTO));
    mvc.perform(get("/api/learn/xray/history").cookie(pid)).andExpect(jsonPath("$.length()").value(1));
    mvc.perform(json(post("/api/learn/xray"), "{\"text\": \"\"}")).andExpect(status().isBadRequest());
  }

  @Test
  void galleryIsHandAnnotated() throws Exception {
    mvc.perform(get("/api/learn/xray/gallery"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(40)))
        .andExpect(jsonPath("$[0].xray.source").value("HAND_ANNOTATED"))
        .andExpect(jsonPath("$[0].xray.punchWord").value("again"))
        .andExpect(jsonPath("$[0].credit.comedian").value("Tim Vine"))
        .andExpect(jsonPath("$[0].xray.credit.sourceUrl").value(org.hamcrest.Matchers.startsWith("https://")));
  }

  @Test
  void selfAnnotationIsComparedWithTheHandAnnotation() throws Exception {
    mvc.perform(json(post("/api/learn/xray/annotate"), """
        {"galleryRef": "g01", "punchline": "I'll tell you what, never again.", "punchWord": "again",
         "formula": "MISDIRECTION", "assumption": "You think it was a dream trip of a lifetime"}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed").value(4))
        .andExpect(jsonPath("$.comparedWith").value("HAND_ANNOTATED"));

    mvc.perform(json(post("/api/learn/xray/annotate"), """
        {"galleryRef": "g01", "punchline": "never again.", "punchWord": "holiday",
         "formula": "RULE_OF_THREE", "assumption": ""}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.checks[?(@.key=='punch-word')].passed").value(false))
        .andExpect(jsonPath("$.checks[?(@.key=='formula')].passed").value(false))
        .andExpect(jsonPath("$.expected.punchWord").value("again"));

    mvc.perform(json(post("/api/learn/xray/annotate"), """
        {"text": "My dad told me to follow my dreams. So I went back to bed.", "punchline": "So I went back to bed.",
         "punchWord": "bed", "formula": "LITERAL", "assumption": "follow your dreams means chase ambitions"}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.comparedWith").value("ESTIMATE"))
        .andExpect(jsonPath("$.checks[?(@.key=='punch-word')].passed").value(true));

    mvc.perform(json(post("/api/learn/xray/annotate"), """
        {"galleryRef": "g01", "punchline": "not in the joke", "punchWord": "x", "formula": "OTHER"}"""))
        .andExpect(status().isBadRequest());
    mvc.perform(json(post("/api/learn/xray/annotate"), """
        {"galleryRef": "nope", "punchline": "x", "punchWord": "x", "formula": "OTHER"}"""))
        .andExpect(status().isNotFound());
    assertThat(xp(ComedySkill.ANATOMY)).isEqualTo(30);
  }

  @Test
  void gymAttemptGivesChecklistAndModelAnswers() throws Exception {
    mvc.perform(get("/api/learn/gym")).andExpect(status().isOk())
        .andExpect(jsonPath("$.formulas.length()").value(9))
        .andExpect(jsonPath("$.premiseCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(60)));
    mvc.perform(get("/api/learn/gym/premise").param("exclude", "p01")).andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not("p01")));

    mvc.perform(json(post("/api/learn/gym/attempts"), """
        {"formula": "RULE_OF_THREE", "premiseId": "p42", "setup": "Yoga has taught me balance, patience",
         "punchline": "and the exact location of the clock."}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.xpAwarded").value(25))
        .andExpect(jsonPath("$.checks[?(@.passed==false)]").isEmpty())
        .andExpect(jsonPath("$.modelAnswers[0].premiseId").value("p42"))
        .andExpect(jsonPath("$.modelAnswers[0].formula").value("RULE_OF_THREE"));

    mvc.perform(json(post("/api/learn/gym/attempts"), """
        {"formula": "EXAGGERATION", "premiseId": "p03", "punchline": "my phone is bad lol"}"""))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.nextRep").value(org.hamcrest.Matchers.startsWith("Next rep:")))
        .andExpect(jsonPath("$.modelAnswers.length()").value(3));

    assertThat(xp(ComedySkill.FORMULAS)).isEqualTo(50);
    assertThat(jokes.findByUserIdOrderByCreatedAtDesc(user)).hasSize(2)
        .allSatisfy(j -> assertThat(j.getSource()).isEqualTo(JokeSource.FORMULA_GYM));
    assertThat(gymAttempts.findByUserId(user)).hasSize(2);

    mvc.perform(get("/api/learn/gym/stats").cookie(pid)).andExpect(status().isOk())
        .andExpect(jsonPath("$[?(@.formula=='RULE_OF_THREE')].reps").value(1));

    mvc.perform(json(post("/api/learn/gym/attempts"), """
        {"formula": "RULE_OF_THREE", "premiseId": "zzz", "punchline": "x"}""")).andExpect(status().isBadRequest());
    mvc.perform(json(post("/api/learn/gym/attempts"), """
        {"formula": "CALLBACK", "premiseId": "p01", "punchline": "x"}""")).andExpect(status().isBadRequest());
    mvc.perform(json(post("/api/learn/gym/attempts"), """
        {"formula": "RULE_OF_THREE", "premiseId": "p01", "punchline": ""}""")).andExpect(status().isBadRequest());
  }
}
