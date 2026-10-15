package app.punchline.user;

import java.lang.annotation.*;

/**
 * Controller parameter annotation: {@code @CurrentUser UUID userId} resolves the
 * caller from the {@code pid} cookie, creating an anonymous user on first visit.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CurrentUser {}
