package app.jokesmith.practice.association;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssociationItemRepository extends JpaRepository<AssociationItem, Long> {
  List<AssociationItem> findBySessionIdOrderByPosition(Long sessionId);
}
