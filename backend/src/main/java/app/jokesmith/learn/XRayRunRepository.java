package app.jokesmith.learn;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface XRayRunRepository extends JpaRepository<XRayRun, Long> {
  List<XRayRun> findTop10ByUserIdOrderByCreatedAtDesc(UUID userId);
  long countByUserId(UUID userId);
}
