package dev.brunogusmao.api.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração do módulo Auth (checklist de docs/java-migration/01-auth.md):
 * e-mail fora da allowlist é rejeitado; GET /api/auth/me sem cookie -> 401; e-mail
 * permitido faz find-or-create do User.
 *
 * A validação de allowlist + find-or-create (AllowedEmailsOAuth2UserService#loadUser) só é
 * disparada depois de uma chamada HTTP real ao userinfo endpoint do Google dentro do
 * DefaultOAuth2UserService herdado, o que não dá para simular sem um mock server OAuth2
 * completo. Por isso testamos authorizeAndPersist(...) diretamente (package-private,
 * mesmo pacote) — é exatamente a regra de negócio que o checklist pede, só sem o transporte
 * HTTP em volta, que é código de framework já testado pelo próprio Spring Security.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class AuthIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void appProperties(DynamicPropertyRegistry registry) {
        registry.add("app.security.allowed-emails", () -> "allowed@example.com");
        registry.add("app.security.jwt-secret", () -> "01234567890123456789012345678901");
        registry.add("app.security.jwt-cookie-name", () -> "access_token");
        // O client registration do Google é construído no startup do contexto mesmo sem
        // nenhum login ser exercitado nestes testes — precisa de client-id/secret não vazios
        // pra não falhar a inicialização.
        registry.add("spring.security.oauth2.client.registration.google.client-id", () -> "test-client-id");
        registry.add("spring.security.oauth2.client.registration.google.client-secret", () -> "test-client-secret");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AllowedEmailsOAuth2UserService allowedEmailsOAuth2UserService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Test
    void meWithoutCookieReturns401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meWithValidCookieReturns200WithUserData() throws Exception {
        User user = allowedEmailsOAuth2UserService.authorizeAndPersist(
                "allowed@example.com", "Allowed User", "http://img");
        String token = jwtService.generateToken(user);

        mockMvc.perform(get("/api/auth/me").cookie(new jakarta.servlet.http.Cookie("access_token", token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(user.getId().toString()))
                .andExpect(jsonPath("$.email").value("allowed@example.com"))
                .andExpect(jsonPath("$.name").value("Allowed User"));
    }

    @Test
    void logoutWithoutCookieReturns401() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void emailOutsideAllowlistIsRejected() {
        assertThatThrownBy(() ->
                allowedEmailsOAuth2UserService.authorizeAndPersist("blocked@example.com", "Blocked User", null))
                .isInstanceOf(OAuth2AuthenticationException.class);

        assertThat(userRepository.findByEmail("blocked@example.com")).isEmpty();
    }

    @Test
    void emailInsideAllowlistIsFindOrCreated() {
        User created = allowedEmailsOAuth2UserService.authorizeAndPersist(
                "allowed@example.com", "Allowed User", "http://img");
        assertThat(created.getId()).isNotNull();
        assertThat(created.getEmail()).isEqualTo("allowed@example.com");

        // Segunda chamada (case/whitespace diferentes) deve reusar o mesmo User, não criar outro.
        User again = allowedEmailsOAuth2UserService.authorizeAndPersist(
                "  Allowed@Example.com ", "Allowed User", "http://img");
        assertThat(again.getId()).isEqualTo(created.getId());
    }
}
