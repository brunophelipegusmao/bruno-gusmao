package dev.brunogusmao.api.todos;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.brunogusmao.api.auth.AppSecurityProperties;
import dev.brunogusmao.api.auth.JwtService;
import dev.brunogusmao.api.auth.User;
import dev.brunogusmao.api.auth.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração do módulo Todos — o coração do modelo de dois usuários (ver
 * checklist de docs/java-migration/06-todos.md). Usa dois usuários reais persistidos via
 * {@link UserRepository} e um JWT válido por usuário (via {@link JwtService}), enviado
 * como cookie httpOnly — não dá pra testar a regra de 403/404 de {@code assertMutable}
 * com {@code @WithMockUser} porque a lógica depende do UUID real do usuário autenticado.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
class TodoControllerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void appProperties(DynamicPropertyRegistry registry) {
        registry.add("app.security.allowed-emails", () -> "userA@example.com,userB@example.com");
        registry.add("app.security.jwt-secret", () -> "01234567890123456789012345678901");
        registry.add("app.security.jwt-cookie-name", () -> "access_token");
        // Client registration do Google é montado no startup mesmo sem login ser
        // exercitado nestes testes — precisa de client-id/secret não vazios.
        registry.add("spring.security.oauth2.client.registration.google.client-id", () -> "test-client-id");
        registry.add("spring.security.oauth2.client.registration.google.client-secret", () -> "test-client-secret");
    }

    @Autowired
    private MockMvc mockMvc;

    // Instanciado manualmente, não via @Autowired: no Spring Boot 4.1 o bean autoconfigurado
    // é tools.jackson.databind.ObjectMapper (Jackson 3, o novo default), não
    // com.fasterxml.jackson.databind.ObjectMapper (Jackson 2 "clássico") — este último só
    // está no classpath transitivamente via springdoc/swagger-core, sem virar bean Spring.
    // Autowirar o tipo clássico falha com NoSuchBeanDefinitionException (mesmo problema
    // preexistente em KanbanTaskControllerIT). Uma instância local evita depender de qual
    // ObjectMapper o Spring registra internamente — MockMvc já devolve a resposta como
    // String JSON de qualquer forma.
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AppSecurityProperties securityProperties;

    private User userA;
    private User userB;
    private Cookie cookieA;
    private Cookie cookieB;

    @BeforeEach
    void setUp() {
        // E-mail com sufixo aleatório por teste: o Postgres real do Testcontainers persiste
        // entre métodos de teste (sem rollback automático aqui), e "email" tem constraint
        // UNIQUE — sem isso, o segundo teste que rodasse colidiria com o primeiro.
        String suffix = UUID.randomUUID().toString();
        userA = userRepository.save(new User("User A", "userA-" + suffix + "@example.com", null));
        userB = userRepository.save(new User("User B", "userB-" + suffix + "@example.com", null));
        cookieA = new Cookie(securityProperties.getJwtCookieName(), jwtService.generateToken(userA));
        cookieB = new Cookie(securityProperties.getJwtCookieName(), jwtService.generateToken(userB));
    }

    // ---- Autenticação ----

    @Test
    void createWithoutCookieReturns401() throws Exception {
        String body = objectMapper.writeValueAsString(new TodoCreateBody("Sem cookie", null, null));

        mockMvc.perform(post("/api/todos")
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void listWithoutCookieReturns401() throws Exception {
        mockMvc.perform(get("/api/todos"))
                .andExpect(status().isUnauthorized());
    }

    // ---- Ownership: todo privado ----

    @Test
    void privateTodoOwnerCanReadEditAndDelete() throws Exception {
        UUID todoId = createTodo(cookieA, "Tarefa privada", null, false);

        // userA aparece na própria listagem.
        mockMvc.perform(get("/api/todos").cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + todoId + "')]").exists());

        String updateBody = objectMapper.writeValueAsString(new TodoUpdateBody("Editado pelo dono", null, null, null));
        mockMvc.perform(patch("/api/todos/" + todoId).cookie(cookieA)
                        .contentType("application/json")
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Editado pelo dono"));

        mockMvc.perform(delete("/api/todos/" + todoId).cookie(cookieA))
                .andExpect(status().isOk());
    }

    @Test
    void privateTodoIsForbiddenToOtherUserAndHiddenFromTheirListing() throws Exception {
        UUID todoId = createTodo(cookieA, "Tarefa privada de A", null, false);

        // Não aparece na listagem de userB.
        mockMvc.perform(get("/api/todos").cookie(cookieB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + todoId + "')]").doesNotExist());

        String updateBody = objectMapper.writeValueAsString(new TodoUpdateBody("Tentativa de B", null, null, null));
        mockMvc.perform(patch("/api/todos/" + todoId).cookie(cookieB)
                        .contentType("application/json")
                        .content(updateBody))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/todos/" + todoId).cookie(cookieB))
                .andExpect(status().isForbidden());
    }

    // ---- Ownership: todo compartilhado ----

    @Test
    void sharedTodoIsVisibleAndMutableByAnyAuthenticatedUser() throws Exception {
        UUID todoId = createTodo(cookieA, "Tarefa compartilhada", null, true);

        // Aparece na listagem de userB, mesmo não sendo o dono.
        mockMvc.perform(get("/api/todos").cookie(cookieB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + todoId + "')]").exists());

        String updateBody = objectMapper.writeValueAsString(new TodoUpdateBody("Editado por B", null, null, true));
        mockMvc.perform(patch("/api/todos/" + todoId).cookie(cookieB)
                        .contentType("application/json")
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Editado por B"))
                .andExpect(jsonPath("$.done").value(true))
                // owner continua sendo userA mesmo editado por userB.
                .andExpect(jsonPath("$.ownerId").value(userA.getId().toString()));

        mockMvc.perform(delete("/api/todos/" + todoId).cookie(cookieB))
                .andExpect(status().isOk());
    }

    // ---- Owner nunca vem do client ----

    @Test
    void ownerIsAlwaysTheAuthenticatedUserRegardlessOfRequestBody() throws Exception {
        // O DTO de criação não tem campo ownerId — mesmo que o client tente enviar um
        // campo extra chamado "ownerId", o Jackson simplesmente ignora (não existe no
        // record) e o owner persistido é sempre o usuário do cookie.
        String bodyWithForeignOwnerId = """
                {"title":"Tenta forjar owner","ownerId":"%s"}
                """.formatted(userB.getId());

        String response = mockMvc.perform(post("/api/todos").cookie(cookieA)
                        .contentType("application/json")
                        .content(bodyWithForeignOwnerId))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        org.assertj.core.api.Assertions.assertThat(response).contains(userA.getId().toString());
        org.assertj.core.api.Assertions.assertThat(response).doesNotContain(userB.getId().toString());
    }

    // ---- Merge parcial ----

    @Test
    void partialUpdateDoesNotResetSharedWhenOmitted() throws Exception {
        UUID todoId = createTodo(cookieA, "Tarefa compartilhada", null, true);

        // PATCH que só envia "done" — não deve resetar "shared" para false.
        String partialBody = """
                {"done":true}
                """;
        mockMvc.perform(patch("/api/todos/" + todoId).cookie(cookieA)
                        .contentType("application/json")
                        .content(partialBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.done").value(true))
                .andExpect(jsonPath("$.shared").value(true));
    }

    // ---- 404 ----

    @Test
    void updateNonExistentReturns404() throws Exception {
        String updateBody = objectMapper.writeValueAsString(new TodoUpdateBody("Não existe", null, null, null));

        mockMvc.perform(patch("/api/todos/" + UUID.randomUUID()).cookie(cookieA)
                        .contentType("application/json")
                        .content(updateBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteNonExistentReturns404() throws Exception {
        mockMvc.perform(delete("/api/todos/" + UUID.randomUUID()).cookie(cookieA))
                .andExpect(status().isNotFound());
    }

    // ---- Helpers ----

    private UUID createTodo(Cookie authorCookie, String title, String description, boolean shared) throws Exception {
        String body = objectMapper.writeValueAsString(new TodoCreateBody(title, description, shared));

        String response = mockMvc.perform(post("/api/todos").cookie(authorCookie)
                        .contentType("application/json")
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        return UUID.fromString(objectMapper.readTree(response).get("id").asText());
    }

    private record TodoCreateBody(String title, String description, Boolean shared) {
    }

    private record TodoUpdateBody(String title, String description, Boolean shared, Boolean done) {
    }
}
