package app.jokesmith.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/me")
public class MeController {
  public record MeDto(UUID id, String handle) {}
  public record RenameRequest(@NotBlank @Size(min = 2, max = 32) @Pattern(regexp = "[\\p{L}\\p{N}_ .-]+") String handle) {}

  private final UserService users;

  public MeController(UserService users) {
    this.users = users;
  }

  @GetMapping
  public MeDto me(@CurrentUser UUID userId) {
    return new MeDto(userId, users.getOrCreate(userId).getHandle());
  }

  @PutMapping
  public MeDto rename(@CurrentUser UUID userId, @Valid @RequestBody RenameRequest body) {
    return new MeDto(userId, users.rename(userId, body.handle()).getHandle());
  }
}
