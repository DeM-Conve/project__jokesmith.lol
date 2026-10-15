package app.jokesmith.workshop.arena;

import app.jokesmith.workshop.arena.ArenaRepository.PairKey;
import app.jokesmith.workshop.arena.ArenaRepository.PoolJoke;
import java.util.List;
import java.util.Set;

/** Test bridge to the package-private pair selection. */
public final class ArenaServiceAccess {
  private ArenaServiceAccess() {}

  public static PoolJoke[] choose(List<PoolJoke> pool, Set<PairKey> voted, boolean samePrompt) {
    return ArenaService.choosePair(pool, voted, samePrompt);
  }
}
