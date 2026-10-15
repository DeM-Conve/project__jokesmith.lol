package app.punchline.practice.association;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssociationSessionRepository extends JpaRepository<AssociationSession, Long> {
  Optional<AssociationSession> findByIdAndUserId(Long id, UUID userId);
}
