package app.jokesmith.core;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JokeRepository extends JpaRepository<Joke, Long> {
  List<Joke> findByUserIdOrderByCreatedAtDesc(UUID userId);
  List<Joke> findBySourceAndPromptRef(JokeSource source, String promptRef);
}
