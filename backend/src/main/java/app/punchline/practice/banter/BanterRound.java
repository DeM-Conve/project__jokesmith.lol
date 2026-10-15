package app.punchline.practice.banter;

import jakarta.persistence.*;
import java.time.Instant;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** One line and the user's reply (table {@code banter_round}). */
@Entity
@Table(name = "banter_round")
public class BanterRound {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "session_id", nullable = false)
  private Long sessionId;

  @Column(name = "round_no", nullable = false)
  private short roundNo;

  @Column(name = "line_key", nullable = false, length = 16)
  private String lineKey;

  @Column(nullable = false, length = 300)
  private String line;

  @Column(length = 300)
  private String reply;

  @Column(name = "response_ms")
  private Integer responseMs;

  @Column(name = "timed_out")
  private Boolean timedOut;

  private Short wit;
  private Short surprise;
  private Short kindness;

  @Column(length = 400)
  private String tip;

  @Column(length = 300)
  private String example;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "example_technique", columnDefinition = "banter_technique")
  private BanterTechnique exampleTechnique;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(name = "self_rating", columnDefinition = "banter_self_rating")
  private BanterSelfRating selfRating;

  @Column(name = "joke_id")
  private Long jokeId;

  @Column(name = "answered_at")
  private Instant answeredAt;

  protected BanterRound() {}

  public BanterRound(Long sessionId, int roundNo, String lineKey, String line) {
    this.sessionId = sessionId;
    this.roundNo = (short) roundNo;
    this.lineKey = lineKey;
    this.line = line;
  }

  public void answer(String reply, int responseMs, BanterScorer.Score score, BanterLineCatalog.Example example) {
    this.reply = reply;
    this.responseMs = responseMs;
    this.timedOut = score.timedOut();
    this.wit = (short) score.wit();
    this.surprise = (short) score.surprise();
    this.kindness = (short) score.kindness();
    this.tip = score.tip();
    this.example = example == null ? null : example.text();
    this.exampleTechnique = example == null ? null : example.technique();
    this.answeredAt = Instant.now();
  }

  public boolean isAnswered() { return answeredAt != null; }
  public Long getId() { return id; }
  public Long getSessionId() { return sessionId; }
  public int getRoundNo() { return roundNo; }
  public String getLineKey() { return lineKey; }
  public String getLine() { return line; }
  public String getReply() { return reply; }
  public Integer getResponseMs() { return responseMs; }
  public Boolean getTimedOut() { return timedOut; }
  public Integer getWit() { return wit == null ? null : (int) wit; }
  public Integer getSurprise() { return surprise == null ? null : (int) surprise; }
  public Integer getKindness() { return kindness == null ? null : (int) kindness; }
  public String getTip() { return tip; }
  public String getExample() { return example; }
  public BanterTechnique getExampleTechnique() { return exampleTechnique; }
  public BanterSelfRating getSelfRating() { return selfRating; }
  public void setSelfRating(BanterSelfRating selfRating) { this.selfRating = selfRating; }
  public Long getJokeId() { return jokeId; }
  public void setJokeId(Long jokeId) { this.jokeId = jokeId; }
}
