package dev.brunogusmao.api.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * O Resource Server do Spring Security por padrão só lê o JWT do header
 * {@code Authorization: Bearer <token>}. Como o token aqui viaja em cookie httpOnly (não em
 * header — ver docs/java-migration/01-auth.md, passo 5), é preciso um resolver customizado.
 */
@Component
public class CookieBearerTokenResolver implements BearerTokenResolver {

    private final AppSecurityProperties properties;

    public CookieBearerTokenResolver(AppSecurityProperties properties) {
        this.properties = properties;
    }

    @Override
    public String resolve(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> properties.getJwtCookieName().equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }
}
