package app.punchline.core;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** A joke in the shared bank (table {@code joke}). */
@Entity
@Table(name = "joke")
public class Joke {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(nullable = false, length = 500)
  private String setup = "";

  @Column(nullable = false, length = 500)
  private String punchline;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "joke_source")
  private JokeSource source;

  @Column(name = "prompt_ref", length = 64)
  private String promptRef;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Joke() {}

  public Joke(UUID userId, String setup, String punchline, JokeSource source, String promptRef) {
    this.userId = userId;
    this.setup = setup == null ? "" : setup;
    this.punchline = punchline;
    this.source = source;
    this.promptRef = promptRef;
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public String getSetup() { return setup; }
  public void setSetup(String setup) { this.setup = setup == null ? "" : setup; }
  public String getPunchline() { return punchline; }
  public void setPunchline(String punchline) { this.punchline = punchline; }
  public JokeSource getSource() { return source; }
  public String getPromptRef() { return promptRef; }
  public Instant getCreatedAt() { return createdAt; }
}
