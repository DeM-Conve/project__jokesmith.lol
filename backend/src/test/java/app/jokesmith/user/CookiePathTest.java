package app.jokesmith.user;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CookiePathTest {
  @Test
  void rootWithoutABasePath() {
    assertThat(CurrentUserResolver.cookiePath("")).isEqualTo("/");
    assertThat(CurrentUserResolver.cookiePath(null)).isEqualTo("/");
    assertThat(CurrentUserResolver.cookiePath("/")).isEqualTo("/");
  }

  @Test
  void theSubPathOtherwise() {
    assertThat(CurrentUserResolver.cookiePath("/jokesmith.lol")).isEqualTo("/jokesmith.lol");
    assertThat(CurrentUserResolver.cookiePath("jokesmith.lol/")).isEqualTo("/jokesmith.lol");
  }
}
