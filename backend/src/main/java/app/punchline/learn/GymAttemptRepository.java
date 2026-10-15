package app.punchline.learn;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GymAttemptRepository extends JpaRepository<GymAttempt, Long> {
  List<GymAttempt> findByUserId(UUID userId);
}
