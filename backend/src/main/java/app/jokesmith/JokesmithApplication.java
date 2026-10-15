package app.jokesmith;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class JokesmithApplication {
  public static void main(String[] args) {
    SpringApplication.run(JokesmithApplication.class, args);
  }
}
