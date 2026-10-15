package app.punchline.ai;

import java.util.Optional;

/**
 * The one gateway to the language model. Every AI feature MUST work without it:
 * when {@link #available()} is false (no ANTHROPIC_API_KEY) or a call fails, the
 * methods return empty and the feature falls back to its offline/heuristic path.
 */
public interface AiClient {
  boolean available();

  /** Plain-text completion. */
  Optional<String> complete(String system, String user, int maxTokens);

  /**
   * Completion parsed as JSON into {@code type} (a record). The system prompt should
   * describe the exact JSON shape; fences and prose around the object are tolerated.
   */
  <T> Optional<T> completeJson(String system, String user, int maxTokens, Class<T> type);
}
