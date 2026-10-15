package app.jokesmith.workshop;

import app.jokesmith.core.Joke;
import app.jokesmith.core.JokeRepository;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Ownership-checked access to the shared joke bank for the workshop feature. */
@Service
public class WorkshopJokes {
  /** The system writer that owns the arena's seed jokes (created in V301). */
  public static final UUID HOUSE_USER = UUID.fromString("00000000-0000-0000-0000-000000000300");

  private final JokeRepository jokes;

  public WorkshopJokes(JokeRepository jokes) {
    this.jokes = jokes;
  }

  /** The caller's joke, or 404 (also for someone else's joke: we don't reveal it exists). */
  @Transactional(readOnly = true)
  public Joke owned(UUID userId, long jokeId) {
    return jokes.findById(jokeId)
        .filter(j -> j.getUserId().equals(userId))
        .orElseThrow(() -> notFound("Joke " + jokeId + " not found"));
  }

  public static ResponseStatusException notFound(String msg) {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, msg);
  }

  public static ResponseStatusException badRequest(String msg) {
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
  }

  public static ResponseStatusException conflict(String msg) {
    return new ResponseStatusException(HttpStatus.CONFLICT, msg);
  }
}
