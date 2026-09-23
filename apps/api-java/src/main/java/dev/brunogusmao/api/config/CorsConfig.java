package dev.brunogusmao.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Espelha exatamente a config do {@code @fastify/cors} em apps/api/src/main.ts:
 * métodos explícitos (DELETE/PATCH ficam de fora por padrão em CORS "simples" e
 * quebram sem isso — ver armadilha #2 do CLAUDE.md original) + credentials habilitado
 * pra o cookie de sessão/JWT ser enviado pelo browser.
 */
@Configuration
public class CorsConfig {

    private final String webUrl;

    public CorsConfig(@Value("${app.web-url}") String webUrl) {
        this.webUrl = webUrl;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(webUrl));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "Authorization", "Cookie"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
