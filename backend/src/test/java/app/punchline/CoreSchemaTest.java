package app.punchline;

import static org.assertj.core.api.Assertions.assertThat;

import app.punchline.core.*;
import app.punchline.user.UserService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class CoreSchemaTest extends PostgresTestBase {
  @Autowired UserService users;
  @Autowired JokeBank bank;
  @Autowired ActivityLog activity;
  @Autowired JokeRepository jokes;
  @Autowired PracticeEventRepository events;

  @Test
  void savesJokesAndEvents() {
    UUID id = UUID.randomUUID();
    assertThat(users.getOrCreate(id).getHandle()).isNotBlank();
    bank.save(id, "I told my wife", "she should embrace her mistakes. She hugged me.", JokeSource.NOTEBOOK, null);
    activity.record(id, ComedySkill.ANATOMY, 25);
    assertThat(jokes.findByUserIdOrderByCreatedAtDesc(id)).hasSize(1);
    assertThat(events.findByUserIdOrderByCreatedAtDesc(id)).extracting(PracticeEvent::getSkill)
        .containsExactly(ComedySkill.ANATOMY);
  }
}
