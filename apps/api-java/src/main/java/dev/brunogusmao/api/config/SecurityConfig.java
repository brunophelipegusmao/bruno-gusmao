package dev.brunogusmao.api.config;

import dev.brunogusmao.api.auth.AllowedEmailsOAuth2UserService;
import dev.brunogusmao.api.auth.AppSecurityProperties;
import dev.brunogusmao.api.auth.CookieBearerTokenResolver;
import dev.brunogusmao.api.auth.OAuth2LoginSuccessHandler;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Fonte única de verdade de autorização de toda a API (ver matriz completa e a ordem
 * comentada dos requestMatchers em docs/java-migration/00-arquitetura.md). Módulos de
 * recurso NÃO editam esta classe — só implementam controllers normalmente.
 */
@Configuration
@EnableConfigurationProperties(AppSecurityProperties.class)
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                     CorsConfigurationSource corsConfigurationSource,
                                                     AllowedEmailsOAuth2UserService allowedEmailsOAuth2UserService,
                                                     OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
                                                     CookieBearerTokenResolver cookieBearerTokenResolver,
                                                     JwtDecoder jwtDecoder) throws Exception {
        http
                // CSRF desabilitado: o JWT viaja em cookie httpOnly (inacessível a JS) e a
                // mitigação equivalente ao que o BetterAuth já faz hoje é cookie SameSite=Lax
                // (bloqueia POST cross-site) + CORS restrito à origem exata do frontend
                // (CorsConfig, app.web-url) — ver 00-arquitetura.md.
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                // Sem HttpSession do lado do servidor: o JWT é a única fonte de verdade.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/docs/**", "/api-docs/**", "/swagger-ui/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**").permitAll()
                        .requestMatchers("/ws/**").permitAll() // auth do handshake é feita dentro do handler, não aqui

                        .requestMatchers(HttpMethod.GET, "/api/badges").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/projects/all").authenticated() // antes do permitAll de baixo, path literal não colide
                        .requestMatchers(HttpMethod.GET, "/api/projects").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/posts/all").authenticated() // TEM que vir antes de /api/posts/{slug}:
                        .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()          // "all" também bate no padrão {slug} de 1 segmento
                        .requestMatchers(HttpMethod.GET, "/api/posts/{slug}").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/kanban-tasks").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/site-settings").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()

                        .requestMatchers("/api/todos/**").authenticated() // inclui GET — resposta é escopada por usuário

                        .requestMatchers("/api/**").authenticated() // catch-all: cobre todo POST/PATCH/DELETE de todos os módulos
                        .anyRequest().permitAll()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo.userService(allowedEmailsOAuth2UserService))
                        .successHandler(oAuth2LoginSuccessHandler)
                )
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .bearerTokenResolver(cookieBearerTokenResolver)
                        .jwt(jwt -> jwt.decoder(jwtDecoder))
                );

        return http.build();
    }

    /**
     * Verifica o JWT próprio emitido em {@code JwtService} — mesma chave HMAC
     * ({@code app.security.jwt-secret}), HS256. O token chega via cookie (não header
     * {@code Authorization}), resolvido por {@link CookieBearerTokenResolver}.
     */
    @Bean
    public JwtDecoder jwtDecoder(AppSecurityProperties properties) {
        SecretKeySpec secretKey = new SecretKeySpec(
                properties.getJwtSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        return NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
