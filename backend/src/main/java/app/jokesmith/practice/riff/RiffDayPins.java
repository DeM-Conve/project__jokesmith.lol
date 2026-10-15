package app.jokesmith.practice.riff;

import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * The prompt for a date: whatever {@code riff_day} pinned it to, or - the first time
 * the date is asked for - the catalog's pick, pinned now. Its own transaction, so
 * read-only callers can still pin.
 */
@Component
public class RiffDayPins {
  private final JdbcTemplate jdbc;
  private final RiffPromptCatalog catalog;

  public RiffDayPins(JdbcTemplate jdbc, RiffPromptCatalog catalog) {
    this.jdbc = jdbc;
    this.catalog = catalog;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public RiffPrompt promptFor(LocalDate date) {
    List<Integer> pinned = jdbc.queryForList("SELECT prompt_index FROM riff_day WHERE prompt_date = ?", Integer.class, date);
    if (pinned.isEmpty()) {
      jdbc.update("INSERT INTO riff_day (prompt_date, prompt_index) VALUES (?, ?) ON CONFLICT DO NOTHING",
          date, catalog.forDate(date).index());
      pinned = jdbc.queryForList("SELECT prompt_index FROM riff_day WHERE prompt_date = ?", Integer.class, date);
    }
    return catalog.get(pinned.get(0));
  }
}
