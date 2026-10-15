package app.jokesmith.practice.banter;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BanterSessionRepository extends JpaRepository<BanterSession, Long> {
  Optional<BanterSession> findByIdAndUserId(Long id, UUID userId);

  List<BanterSession> findTop6ByUserIdAndPersonaOrderByCreatedAtDesc(UUID userId, BanterPersona persona);
}
