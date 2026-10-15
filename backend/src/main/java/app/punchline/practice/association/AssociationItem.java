package app.punchline.practice.association;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** One brainstormed association (table {@code association_item}). */
@Entity
@Table(name = "association_item")
public class AssociationItem {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "session_id", nullable = false)
  private Long sessionId;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(nullable = false, columnDefinition = "association_category")
  private AssociationCategory category;

  @Column(nullable = false, length = 80)
  private String text;

  @Column(nullable = false)
  private short position;

  protected AssociationItem() {}

  public AssociationItem(Long sessionId, AssociationCategory category, String text, int position) {
    this.sessionId = sessionId;
    this.category = category;
    this.text = text;
    this.position = (short) position;
  }

  public Long getId() { return id; }
  public Long getSessionId() { return sessionId; }
  public AssociationCategory getCategory() { return category; }
  public String getText() { return text; }
  public int getPosition() { return position; }
}
