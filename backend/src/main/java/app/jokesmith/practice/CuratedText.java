package app.jokesmith.practice;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

/** Reads the practice feature's curated data files (src/main/resources/practice). */
public final class CuratedText {
  private CuratedText() {}

  /** Lines of every resource matching the classpath pattern, files in name order, "# " comment lines dropped. */
  public static List<String> lines(String pattern) {
    try {
      Resource[] found = new PathMatchingResourcePatternResolver().getResources("classpath:" + pattern);
      Arrays.sort(found, Comparator.comparing(r -> String.valueOf(r.getFilename())));
      List<String> out = new ArrayList<>();
      for (Resource r : found) {
        String text = r.getContentAsString(StandardCharsets.UTF_8);
        for (String line : text.split("\\R")) {
          if (!line.startsWith("# ") && !line.equals("#")) out.add(line.strip());
        }
        out.add("");
      }
      return out;
    } catch (IOException e) {
      throw new UncheckedIOException("cannot read curated data " + pattern, e);
    }
  }
}
