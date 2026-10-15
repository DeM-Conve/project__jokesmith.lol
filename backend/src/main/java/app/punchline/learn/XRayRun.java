package app.punchline.learn;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** One joke put under the X-ray (table {@code learn_xray_run}). */
@Entity
@Table(name = "learn_xray_run")
public class XRayRun {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "learn_xray_mode")
  private XRayMode mode;

  @Column(name = "gallery_ref", length = 64)
  private String galleryRef;

  @Column(name = "joke_text", nullable = false, length = 600)
  private String jokeText;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "learn_joke_formula")
  private JokeFormula formula;

  @Column(name = "punch_word", length = 64)
  private String punchWord;

  @Column(name = "checks_passed")
  private Short checksPassed;

  @Column(name = "checks_total")
  private Short checksTotal;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected XRayRun() {}

  public XRayRun(UUID userId, XRayMode mode, String galleryRef, String jokeText, JokeFormula formula,
      String punchWord, Integer checksPassed, Integer checksTotal) {
    this.userId = userId;
    this.mode = mode;
    this.galleryRef = galleryRef;
    this.jokeText = jokeText.length() > 600 ? jokeText.substring(0, 600) : jokeText;
    this.formula = formula;
    this.punchWord = punchWord == null || punchWord.length() <= 64 ? punchWord : punchWord.substring(0, 64);
    this.checksPassed = checksPassed == null ? null : checksPassed.shortValue();
    this.checksTotal = checksTotal == null ? null : checksTotal.shortValue();
  }

  public Long getId() { return id; }
  public UUID getUserId() { return userId; }
  public XRayMode getMode() { return mode; }
  public String getGalleryRef() { return galleryRef; }
  public String getJokeText() { return jokeText; }
  public JokeFormula getFormula() { return formula; }
  public String getPunchWord() { return punchWord; }
  public Short getChecksPassed() { return checksPassed; }
  public Short getChecksTotal() { return checksTotal; }
  public Instant getCreatedAt() { return createdAt; }
}
