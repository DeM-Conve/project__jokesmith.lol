package app.punchline.core;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PracticeEventRepository extends JpaRepository<PracticeEvent, Long> {
  List<PracticeEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
