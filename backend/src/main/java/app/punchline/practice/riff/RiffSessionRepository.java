package app.punchline.practice.riff;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiffSessionRepository extends JpaRepository<RiffSession, Long> {
  List<RiffSession> findByUserIdAndPromptDate(UUID userId, LocalDate promptDate);

  List<RiffSession> findByUserIdAndPromptDateBetween(UUID userId, LocalDate from, LocalDate to);
}
