package app.punchline.workshop.notebook;

import app.punchline.core.JokeSource;
import app.punchline.user.CurrentUser;
import app.punchline.workshop.notebook.NotebookRepository.TagCount;
import app.punchline.workshop.notebook.NotebookService.Bit;
import app.punchline.workshop.notebook.NotebookService.Callback;
import app.punchline.workshop.notebook.NotebookService.Filter;
import app.punchline.workshop.notebook.NotebookService.NotebookJoke;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workshop")
public class NotebookController {
  public record JokeBody(@Size(max = 500) String setup, @NotBlank @Size(max = 500) String punchline,
      @Size(max = 8) List<String> tags) {}

  public record FavouriteBody(boolean favourite) {}

  public record TagsBody(@NotNull @Size(max = 8) List<String> tags) {}

  public record ArenaBody(boolean inArena) {}

  public record BitBody(@NotBlank @Size(max = 80) String title, @Size(max = 40) List<Long> jokeIds) {}

  public record BitJokesBody(@NotNull @Size(max = 40) List<Long> jokeIds) {}

  private final NotebookService notebook;

  public NotebookController(NotebookService notebook) {
    this.notebook = notebook;
  }

  @GetMapping("/jokes")
  public List<NotebookJoke> list(@CurrentUser UUID userId, @RequestParam(required = false) JokeSource source,
      @RequestParam(required = false) String q, @RequestParam(required = false) String tag,
      @RequestParam(required = false) Boolean favourite) {
    return notebook.list(userId, new Filter(source, q, tag, favourite));
  }

  @PostMapping("/jokes")
  @ResponseStatus(HttpStatus.CREATED)
  public NotebookJoke create(@CurrentUser UUID userId, @Valid @RequestBody JokeBody body) {
    return notebook.create(userId, body.setup(), body.punchline(), body.tags());
  }

  @PutMapping("/jokes/{id}")
  public NotebookJoke update(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody JokeBody body) {
    return notebook.update(userId, id, body.setup(), body.punchline(), body.tags());
  }

  @DeleteMapping("/jokes/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@CurrentUser UUID userId, @PathVariable long id) {
    notebook.delete(userId, id);
  }

  @PutMapping("/jokes/{id}/favourite")
  public NotebookJoke favourite(@CurrentUser UUID userId, @PathVariable long id, @RequestBody FavouriteBody body) {
    return notebook.setFavourite(userId, id, body.favourite());
  }

  @PutMapping("/jokes/{id}/tags")
  public NotebookJoke tags(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody TagsBody body) {
    return notebook.setTags(userId, id, body.tags());
  }

  @PutMapping("/jokes/{id}/arena")
  public NotebookJoke arena(@CurrentUser UUID userId, @PathVariable long id, @RequestBody ArenaBody body) {
    return notebook.setInArena(userId, id, body.inArena());
  }

  @GetMapping("/tags")
  public List<TagCount> tags(@CurrentUser UUID userId) {
    return notebook.tags(userId);
  }

  /** Callback opportunities: for one joke ({@code jokeId}) or the strongest across the notebook. */
  @GetMapping("/callbacks")
  public List<Callback> callbacks(@CurrentUser UUID userId, @RequestParam(required = false) Long jokeId) {
    return notebook.callbacks(userId, jokeId);
  }

  @GetMapping("/bits")
  public List<Bit> bits(@CurrentUser UUID userId) {
    return notebook.bits(userId);
  }

  @PostMapping("/bits")
  @ResponseStatus(HttpStatus.CREATED)
  public Bit createBit(@CurrentUser UUID userId, @Valid @RequestBody BitBody body) {
    return notebook.createBit(userId, body.title(), body.jokeIds());
  }

  @PutMapping("/bits/{id}")
  public Bit renameBit(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody BitBody body) {
    return notebook.renameBit(userId, id, body.title());
  }

  @DeleteMapping("/bits/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteBit(@CurrentUser UUID userId, @PathVariable long id) {
    notebook.deleteBit(userId, id);
  }

  @PutMapping("/bits/{id}/jokes")
  public Bit setBitJokes(@CurrentUser UUID userId, @PathVariable long id, @Valid @RequestBody BitJokesBody body) {
    return notebook.setBitJokes(userId, id, body.jokeIds());
  }
}
