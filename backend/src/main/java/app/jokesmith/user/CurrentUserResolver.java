package app.jokesmith.user;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.MethodParameter;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

/** Resolves {@code @CurrentUser UUID} from the long-lived {@code pid} cookie. */
@Component
public class CurrentUserResolver implements HandlerMethodArgumentResolver {
  static final String COOKIE = "pid";
  private static final int MAX_AGE = (int) Duration.ofDays(3650).toSeconds();

  private final UserService users;
  private final String cookiePath;

  public CurrentUserResolver(UserService users, @Value("${app.base-path:}") String basePath) {
    this.users = users;
    this.cookiePath = cookiePath(basePath);
  }

  /**
   * The app's own sub-path ({@code /jokesmith.lol}), so apps sharing an origin keep separate
   * cookies; {@code /} at the host root. A cookie set at {@code /} before a base path was
   * configured is still sent under it and still read, and we only set one when none came
   * in, so existing users keep their id and never get a second {@code pid}.
   */
  static String cookiePath(String basePath) {
    String p = basePath == null ? "" : basePath.strip().replaceAll("/+$", "");
    if (p.isEmpty()) return "/";
    return p.startsWith("/") ? p : "/" + p;
  }

  @Override
  public boolean supportsParameter(MethodParameter p) {
    return p.hasParameterAnnotation(CurrentUser.class) && p.getParameterType().equals(UUID.class);
  }

  @Override
  public Object resolveArgument(MethodParameter p, ModelAndViewContainer mav, NativeWebRequest web,
      WebDataBinderFactory binder) {
    HttpServletRequest req = web.getNativeRequest(HttpServletRequest.class);
    UUID id = readCookie(req);
    if (id == null) {
      id = UUID.randomUUID();
      Cookie c = new Cookie(COOKIE, id.toString());
      c.setPath(cookiePath);
      c.setHttpOnly(true);
      c.setSecure(req != null && req.isSecure());
      c.setMaxAge(MAX_AGE);
      c.setAttribute("SameSite", "Lax");
      web.getNativeResponse(HttpServletResponse.class).addCookie(c);
    }
    users.getOrCreate(id);
    return id;
  }

  private static UUID readCookie(HttpServletRequest req) {
    if (req == null || req.getCookies() == null) return null;
    for (Cookie c : req.getCookies()) {
      if (COOKIE.equals(c.getName())) {
        try {
          return UUID.fromString(c.getValue());
        } catch (IllegalArgumentException e) {
          return null;
        }
      }
    }
    return null;
  }
}
