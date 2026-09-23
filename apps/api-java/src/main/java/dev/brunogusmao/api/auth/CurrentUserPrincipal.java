package dev.brunogusmao.api.auth;

import java.util.UUID;

/**
 * Equivalente à interface {@code CurrentUser} de
 * apps/api/src/auth/current-user.decorator.ts ({@code { id, email }}).
 */
public record CurrentUserPrincipal(UUID id, String email) {
}
