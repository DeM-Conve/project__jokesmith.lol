package app.punchline.ai;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/** {@link AiClient} over the Anthropic Messages API. */
@Component
public class ClaudeAiClient implements AiClient {
  private static final Logger log = LoggerFactory.getLogger(ClaudeAiClient.class);

  private final AiProperties props;
  private final RestClient http;
  private final ObjectMapper json;

  public ClaudeAiClient(AiProperties props, ObjectMapper json) {
    this.props = props;
    this.json = json.copy().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    SimpleClientHttpRequestFactory rf = new SimpleClientHttpRequestFactory();
    rf.setConnectTimeout(5_000);
    rf.setReadTimeout(60_000);
    this.http = RestClient.builder().baseUrl(props.baseUrl()).requestFactory(rf).build();
  }

  @Override
  public boolean available() {
    return props.apiKey() != null && !props.apiKey().isBlank();
  }

  @Override
  public Optional<String> complete(String system, String user, int maxTokens) {
    if (!available()) return Optional.empty();
    try {
      JsonNode res = http.post()
          .uri("/v1/messages")
          .header("x-api-key", props.apiKey())
          .header("anthropic-version", "2023-06-01")
          .contentType(MediaType.APPLICATION_JSON)
          .body(Map.of(
              "model", props.model(),
              "max_tokens", maxTokens,
              "system", system,
              "messages", List.of(Map.of("role", "user", "content", user))))
          .retrieve()
          .body(JsonNode.class);
      StringBuilder out = new StringBuilder();
      if (res != null) {
        for (JsonNode block : res.path("content")) {
          if ("text".equals(block.path("type").asText())) out.append(block.path("text").asText());
        }
      }
      return out.isEmpty() ? Optional.empty() : Optional.of(out.toString());
    } catch (RuntimeException e) {
      log.warn("AI call failed, falling back: {}", e.toString());
      return Optional.empty();
    }
  }

  @Override
  public <T> Optional<T> completeJson(String system, String user, int maxTokens, Class<T> type) {
    String sys = system + "\n\nRespond with ONLY a single JSON object, no prose, no code fences.";
    return complete(sys, user, maxTokens).flatMap(text -> parse(text, type));
  }

  <T> Optional<T> parse(String text, Class<T> type) {
    int start = text.indexOf('{');
    int end = text.lastIndexOf('}');
    if (start < 0 || end <= start) return Optional.empty();
    try {
      return Optional.ofNullable(json.readValue(text.substring(start, end + 1), type));
    } catch (Exception e) {
      log.warn("AI returned unparseable JSON for {}: {}", type.getSimpleName(), e.toString());
      return Optional.empty();
    }
  }
}
