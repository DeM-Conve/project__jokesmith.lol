package app.jokesmith.config;

import app.jokesmith.user.CurrentUserResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  private final CurrentUserResolver currentUser;
  private final String frontendUrl;

  public WebConfig(CurrentUserResolver currentUser, @Value("${app.frontend-url}") String frontendUrl) {
    this.currentUser = currentUser;
    this.frontendUrl = frontendUrl;
  }

  @Override
  public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
    resolvers.add(currentUser);
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**").allowedOrigins(frontendUrl).allowedMethods("*").allowCredentials(true);
  }
}
