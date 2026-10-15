package app.punchline.progress;

import app.punchline.core.Joke;
import app.punchline.core.JokeSource;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.repository.Repository;

/** Read-only view of the shared joke bank for progress stats and the Delivery Lab picker. */
public interface ProgressJokeRepository extends Repository<Joke, Long> {
  long countByUserId(UUID userId);

  boolean existsByUserIdAndSourceAndCreatedAtGreaterThanEqual(UUID userId, JokeSource source, Instant since);

  List<Joke> findTop60ByUserIdOrderByCreatedAtDesc(UUID userId);

  java.util.Optional<Joke> findByIdAndUserId(Long id, UUID userId);
}
