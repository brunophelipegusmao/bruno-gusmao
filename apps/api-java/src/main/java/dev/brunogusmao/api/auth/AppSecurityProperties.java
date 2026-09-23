package dev.brunogusmao.api.auth;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Bind de {@code app.security.*} (application.yml) — equivalente aos envs lidos direto em
 * apps/api/src/auth/auth.ts (ALLOWED_EMAIL, BETTER_AUTH_SECRET, ...), mas centralizado num
 * único bean tipado. {@code ALLOWED_EMAILS} chega como string separada por vírgula
 * (ex.: "a@x.com,b@x.com") — o relaxed binding do Spring Boot já converte isso pra
 * {@code List<String>} automaticamente, sem split manual aqui.
 *
 * Registrado via {@code @EnableConfigurationProperties} em
 * {@link dev.brunogusmao.api.config.SecurityConfig}.
 */
@ConfigurationProperties(prefix = "app.security")
public class AppSecurityProperties {

    private List<String> allowedEmails = List.of();
    private String jwtSecret;
    private int jwtExpirationDays = 7;
    private String jwtCookieName = "access_token";
    private String cookieDomain;

    public List<String> getAllowedEmails() {
        return allowedEmails;
    }

    public void setAllowedEmails(List<String> allowedEmails) {
        this.allowedEmails = allowedEmails;
    }

    public String getJwtSecret() {
        return jwtSecret;
    }

    public void setJwtSecret(String jwtSecret) {
        this.jwtSecret = jwtSecret;
    }

    public int getJwtExpirationDays() {
        return jwtExpirationDays;
    }

    public void setJwtExpirationDays(int jwtExpirationDays) {
        this.jwtExpirationDays = jwtExpirationDays;
    }

    public String getJwtCookieName() {
        return jwtCookieName;
    }

    public void setJwtCookieName(String jwtCookieName) {
        this.jwtCookieName = jwtCookieName;
    }

    public String getCookieDomain() {
        return cookieDomain;
    }

    public void setCookieDomain(String cookieDomain) {
        this.cookieDomain = cookieDomain;
    }
}
