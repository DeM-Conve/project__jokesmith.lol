package app.jokesmith.practice;

import static org.assertj.core.api.Assertions.assertThat;

import app.jokesmith.practice.association.AssociationCategory;
import app.jokesmith.practice.association.Collisions;
import app.jokesmith.practice.association.Collisions.Collision;
import app.jokesmith.practice.association.Collisions.Item;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CollisionsTest {
  private static Item i(AssociationCategory c, String t) {
    return new Item(c, t, false);
  }

  private final List<Item> items = List.of(
      i(AssociationCategory.PEOPLE, "the dentist"),
      i(AssociationCategory.PEOPLE, "a crying kid"),
      i(AssociationCategory.PLACES, "the dentist waiting room"),
      i(AssociationCategory.THINGS, "the spit sucker"),
      i(AssociationCategory.PHRASES, "this won't hurt a bit"),
      i(AssociationCategory.FEELINGS, "fake calm"),
      i(AssociationCategory.FEELINGS, "jaw ache pride"));

  @Test
  void pairsDifferentCategoriesAndUsesEachItemOnce() {
    List<Collision> out = Collisions.pick(items, 5, 42);
    assertThat(out).isNotEmpty().hasSizeLessThanOrEqualTo(3);
    Set<Item> used = new HashSet<>();
    for (Collision c : out) {
      assertThat(c.a().category()).isNotEqualTo(c.b().category());
      assertThat(used.add(c.a())).isTrue();
      assertThat(used.add(c.b())).isTrue();
      assertThat(c.surprise()).isBetween(1, 5);
      assertThat(c.prompt()).isNotBlank();
    }
  }

  @Test
  void prefersPairsWithNoSharedWords() {
    List<Collision> out = Collisions.pick(items, 5, 7);
    Collision top = out.get(0);
    assertThat(out).noneSatisfy(c -> assertThat(c.a().text() + "|" + c.b().text()).contains("dentist|").contains("|the dentist"));
    assertThat(top.surprise()).isGreaterThanOrEqualTo(4);
    assertThat(out).allSatisfy(c -> assertThat(c.surprise()).isLessThanOrEqualTo(top.surprise()));
  }

  @Test
  void sameSeedSameCollisions() {
    assertThat(Collisions.pick(items, 5, 3)).isEqualTo(Collisions.pick(items, 5, 3));
  }

  @Test
  void needsTwoCategories() {
    assertThat(Collisions.pick(List.of(i(AssociationCategory.THINGS, "a"), i(AssociationCategory.THINGS, "b")), 5, 1))
        .isEmpty();
  }
}
