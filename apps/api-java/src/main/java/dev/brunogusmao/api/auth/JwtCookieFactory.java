package dev.brunogusmao.api.auth;

import org.springframework.http.ResponseCookie;

/**
 * Monta o cookie do JWT com os mesmos atributos em todo lugar que precisa setá-lo/limpá-lo
 * (login e logout) — evita divergência de {@code path}/{@code sameSite} entre as duas rotas,
 * o que faria o logout falhar em limpar o cookie no browser.
 */
final class JwtCookieFactory {

    private JwtCookieFactory() {
    }

    static ResponseCookie build(AppSecurityProperties properties, boolean secure, String value, long maxAgeSeconds) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(properties.getJwtCookieName(), value)
                .httpOnly(true)
                .secure(secure)
                // Equivalente à mitigação de CSRF do BetterAuth hoje (cookie SameSite=Lax +
                // CORS restrito à origem exata do frontend) — ver 00-arquitetura.md.
                .sameSite("Lax")
                .path("/")
                .maxAge(maxAgeSeconds);

        // Sem isso o cookie fica host-only de api.brunogusmao.dev: o browser nunca o envia
        // pro brunogusmao.dev (frontend), e o PrivateLayout (Server Component) nunca vê o
        // cookie na request — resultado é redirect de volta pro /login mesmo após login OK.
        // Domain=brunogusmao.dev cobre o apex e todos os subdomínios (api., www.).
        String cookieDomain = properties.getCookieDomain();
        if (cookieDomain != null && !cookieDomain.isBlank()) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }
}
