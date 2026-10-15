package app.punchline.practice.banter;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BanterRoundRepository extends JpaRepository<BanterRound, Long> {
  List<BanterRound> findBySessionIdOrderByRoundNo(Long sessionId);

  Optional<BanterRound> findBySessionIdAndRoundNo(Long sessionId, int roundNo);

  List<BanterRound> findBySessionIdIn(Collection<Long> sessionIds);
}
