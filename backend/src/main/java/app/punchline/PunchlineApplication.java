package app.punchline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class PunchlineApplication {
  public static void main(String[] args) {
    SpringApplication.run(PunchlineApplication.class, args);
  }
}
