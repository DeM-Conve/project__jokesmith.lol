package app.punchline.workshop.punchup;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PunchUpSessionRepository extends JpaRepository<PunchUpSession, Long> {
  List<PunchUpSession> findTop10ByUserIdOrderByCreatedAtDesc(UUID userId);
}
