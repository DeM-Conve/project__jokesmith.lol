package app.jokesmith.learn;

import app.jokesmith.core.ComedySkill;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonCompletionRepository extends JpaRepository<LessonCompletion, Long> {
  List<LessonCompletion> findByUserId(UUID userId);
  Optional<LessonCompletion> findByUserIdAndSkill(UUID userId, ComedySkill skill);
}
