package app.punchline.progress;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryTakeRepository extends JpaRepository<DeliveryTake, Long> {
  List<DeliveryTake> findTop20ByUserIdOrderByCreatedAtDesc(UUID userId);

  long countByUserId(UUID userId);
}
