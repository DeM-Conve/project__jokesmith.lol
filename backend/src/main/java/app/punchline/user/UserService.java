package app.punchline.user;

import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
  private static final String[] ADJ = {"Deadpan", "Awkward", "Sneaky", "Dry", "Loud", "Tiny", "Brave", "Sleepy"};
  private static final String[] NOUN = {"Pigeon", "Toaster", "Llama", "Walrus", "Waffle", "Goose", "Potato", "Otter"};

  private final AppUserRepository users;

  public UserService(AppUserRepository users) {
    this.users = users;
  }

  /** The user for this id, created with a random handle if new (or the id is unknown). */
  @Transactional
  public AppUser getOrCreate(UUID id) {
    return users.findById(id).orElseGet(() -> users.save(new AppUser(id, randomHandle())));
  }

  @Transactional
  public AppUser rename(UUID id, String handle) {
    AppUser user = getOrCreate(id);
    user.setHandle(handle.strip());
    return user;
  }

  private static String randomHandle() {
    ThreadLocalRandom r = ThreadLocalRandom.current();
    return ADJ[r.nextInt(ADJ.length)] + NOUN[r.nextInt(NOUN.length)] + r.nextInt(10, 100);
  }
}
