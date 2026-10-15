package app.jokesmith.core;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** The one way any feature saves a joke the user wrote. */
@Service
public class JokeBank {
  private final JokeRepository jokes;

  public JokeBank(JokeRepository jokes) {
    this.jokes = jokes;
  }

  @Transactional
  public Joke save(UUID userId, String setup, String punchline, JokeSource source, String promptRef) {
    return jokes.save(new Joke(userId, setup, punchline, source, promptRef));
  }
}
