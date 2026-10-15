package app.jokesmith.practice.riff;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface RiffBestPickRepository extends JpaRepository<RiffBestPick, Long> {
  Optional<RiffBestPick> findByUserIdAndPromptDate(UUID userId, LocalDate promptDate);

  /** Everyone's pick for a day, newest first, with the picker's handle. */
  interface PickRow {
    String getHandle();
    String getPunchline();
    UUID getUserId();
  }

  @Query(value = """
      SELECT u.handle AS handle, j.punchline AS punchline, p.user_id AS userId
      FROM riff_best_pick p
      JOIN joke j ON j.id = p.joke_id
      JOIN app_user u ON u.id = p.user_id
      WHERE p.prompt_date = :date
      ORDER BY p.picked_at DESC
      LIMIT :limit
      """, nativeQuery = true)
  List<PickRow> picksFor(LocalDate date, int limit);
}
