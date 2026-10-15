package app.punchline.practice.riff;

import app.punchline.practice.CuratedText;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * The year of daily riff setups (resources practice/riff/prompts-*.txt). Everyone gets
 * the same setup on the same calendar day: the day number is mapped through a fixed
 * permutation (multiply by a prime coprime with the list size), so consecutive days
 * jump between themes and nothing repeats until the list is exhausted.
 */
@Component
public class RiffPromptCatalog {
  /** Day #1 of the daily riff. */
  public static final LocalDate LAUNCH = LocalDate.of(2026, 1, 1);
  private static final long STRIDE = 7919; // prime, so coprime with any list size < 7919

  private final List<RiffPrompt> prompts;

  public RiffPromptCatalog() {
    this(CuratedText.lines("practice/riff/prompts-*.txt"));
  }

  RiffPromptCatalog(List<String> lines) {
    List<RiffPrompt> out = new ArrayList<>();
    String setup = null;
    List<String> punchlines = new ArrayList<>();
    for (String line : lines) {
      if (line.startsWith("> ")) {
        if (setup != null) out.add(new RiffPrompt(out.size(), setup, List.copyOf(punchlines)));
        setup = line.substring(2).strip();
        punchlines = new ArrayList<>();
      } else if (line.startsWith("- ") && setup != null) {
        punchlines.add(line.substring(2).strip());
      }
    }
    if (setup != null) out.add(new RiffPrompt(out.size(), setup, List.copyOf(punchlines)));
    if (out.isEmpty()) throw new IllegalStateException("no daily riff prompts found");
    this.prompts = List.copyOf(out);
  }

  public int size() {
    return prompts.size();
  }

  /** 1-based day number ("Riff #287"). */
  public static long dayNumber(LocalDate date) {
    return ChronoUnit.DAYS.between(LAUNCH, date) + 1;
  }

  public RiffPrompt forDate(LocalDate date) {
    long day = ChronoUnit.DAYS.between(LAUNCH, date);
    int index = (int) Math.floorMod(day * STRIDE + 17, (long) prompts.size());
    return prompts.get(index);
  }
}
