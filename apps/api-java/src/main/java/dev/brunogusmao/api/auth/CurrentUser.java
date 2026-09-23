package dev.brunogusmao.api.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Equivalente ao {@code @CurrentUser()} decorator de
 * apps/api/src/auth/current-user.decorator.ts. Uso: parâmetro de controller do tipo
 * {@link CurrentUserPrincipal}, resolvido por {@link CurrentUserArgumentResolver}.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser {
}
