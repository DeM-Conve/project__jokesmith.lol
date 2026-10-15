package app.punchline.practice.riff;

import static org.assertj.core.api.Assertions.assertThat;

import app.punchline.PostgresTestBase;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class RiffDayPinsTest extends PostgresTestBase {
  @Autowired JdbcTemplate jdbc;

  private static RiffPromptCatalog catalogOf(int n) {
    List<String> lines = new ArrayList<>();
    for (int i = 0; i < n; i++) {
      lines.add("> setup " + i);
      lines.add("- punch " + i);
    }
    return new RiffPromptCatalog(lines);
  }

  @Test
  void aShownDayKeepsItsPromptWhenTheCatalogGrows() {
    LocalDate day = LocalDate.of(2026, 3, 14);
    RiffPrompt before = new RiffDayPins(jdbc, catalogOf(5)).promptFor(day);

    RiffPromptCatalog grown = catalogOf(9);
    assertThat(grown.forDate(day).setup()).as("the permutation itself moves").isNotEqualTo(before.setup());
    assertThat(new RiffDayPins(jdbc, grown).promptFor(day).setup()).isEqualTo(before.setup());
  }

  @Test
  void anUnseenDayIsPinnedToTheCatalogPick() {
    LocalDate day = LocalDate.of(2026, 4, 2);
    RiffPromptCatalog catalog = catalogOf(7);
    assertThat(new RiffDayPins(jdbc, catalog).promptFor(day)).isEqualTo(catalog.forDate(day));
  }
}
