package app.jokesmith.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CorsOriginTest {
  @Test
  void dropsThePath() {
    assertThat(WebConfig.origin("http://localhost/jokesmith.lol")).isEqualTo("http://localhost");
    assertThat(WebConfig.origin("https://jokesmith.example.com")).isEqualTo("https://jokesmith.example.com");
    assertThat(WebConfig.origin("http://localhost:8200")).isEqualTo("http://localhost:8200");
  }
}
