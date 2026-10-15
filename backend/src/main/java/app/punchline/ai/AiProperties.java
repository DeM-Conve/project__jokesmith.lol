package app.punchline.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.ai")
public record AiProperties(String apiKey, String model, String baseUrl) {}
