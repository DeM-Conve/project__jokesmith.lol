package app.punchline;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Integration tests extend this: a real Postgres 17 (enums!) with every Flyway
 * migration applied. The AI key is blank, so AiClient.available() is false and
 * every feature runs its offline fallback.
 *
 * <p>Singleton container: started once per JVM and never stopped per class (Ryuk
 * removes it at exit). A per-class {@code @Container} would restart Postgres on a new
 * port while Spring's cached context still points at the old one, breaking every
 * test class after the first.
 */
@SpringBootTest(properties = "app.ai.api-key=")
public abstract class PostgresTestBase {
  @ServiceConnection
  static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

  static {
    POSTGRES.start();
  }
}
