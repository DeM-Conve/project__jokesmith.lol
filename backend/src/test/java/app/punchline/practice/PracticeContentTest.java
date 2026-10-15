package app.punchline.practice;

import static org.assertj.core.api.Assertions.assertThat;

import app.punchline.practice.association.AssociationCategory;
import app.punchline.practice.association.AssociationTopicCatalog;
import app.punchline.practice.banter.BanterLineCatalog;
import app.punchline.practice.banter.BanterPersona;
import app.punchline.practice.riff.RiffPrompt;
import app.punchline.practice.riff.RiffPromptCatalog;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** The curated data files parse and are as big as the product promises. */
class PracticeContentTest {
  @Test
  void aFullYearOfRiffPromptsEachWithModelPunchlines() {
    RiffPromptCatalog catalog = new RiffPromptCatalog();
    assertThat(catalog.size()).isGreaterThanOrEqualTo(365);
    Set<String> setups = new HashSet<>();
    LocalDate start = LocalDate.of(2026, 1, 1);
    for (int d = 0; d < catalog.size(); d++) {
      RiffPrompt p = catalog.forDate(start.plusDays(d));
      assertThat(p.modelPunchlines()).hasSizeBetween(3, 5);
      setups.add(p.setup());
    }
    // the date permutation visits every prompt once before repeating
    assertThat(setups).hasSize(catalog.size());
  }

  @Test
  void sameDateSamePrompt() {
    RiffPromptCatalog a = new RiffPromptCatalog();
    RiffPromptCatalog b = new RiffPromptCatalog();
    LocalDate day = LocalDate.of(2026, 10, 15);
    assertThat(a.forDate(day)).isEqualTo(b.forDate(day));
    assertThat(a.forDate(day).setup()).isNotEqualTo(a.forDate(day.plusDays(1)).setup());
    assertThat(RiffPromptCatalog.dayNumber(LocalDate.of(2026, 1, 1))).isEqualTo(1);
  }

  @Test
  void associationTopicsCoverEveryCategory() {
    AssociationTopicCatalog catalog = new AssociationTopicCatalog();
    assertThat(catalog.names()).hasSizeGreaterThanOrEqualTo(40).contains("Dentist");
    for (String name : catalog.names()) {
      var topic = catalog.find(name).orElseThrow();
      for (AssociationCategory c : AssociationCategory.values()) {
        assertThat(topic.items().get(c)).as(name + " " + c).hasSizeGreaterThanOrEqualTo(6);
      }
    }
    assertThat(catalog.find("my DENTIST appointment")).get().extracting(AssociationTopicCatalog.Topic::name)
        .isEqualTo("Dentist");
  }

  @Test
  void banterBankHasTechniqueTaggedExamples() {
    BanterLineCatalog catalog = new BanterLineCatalog();
    assertThat(catalog.size()).isGreaterThanOrEqualTo(80);
    for (BanterPersona p : BanterPersona.values()) {
      assertThat(catalog.forPersona(p)).hasSizeGreaterThanOrEqualTo(20)
          .allSatisfy(l -> assertThat(l.examples()).hasSizeGreaterThanOrEqualTo(3));
    }
    assertThat(catalog.get("FRIEND-01")).isPresent();
  }
}
