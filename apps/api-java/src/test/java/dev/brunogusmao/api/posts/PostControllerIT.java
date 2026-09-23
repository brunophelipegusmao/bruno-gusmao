package dev.brunogusmao.api.posts;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração do módulo Posts — Postgres real via Testcontainers (evita mocks de
 * banco, ver docs/java-migration/00-arquitetura.md). Cobre a matriz descrita em
 * docs/java-migration/04-posts.md: GET público só mostra visible=true; GET /all exige
 * autenticação e NÃO é confundido com uma busca por slug "all"; GET /{slug} é público e
 * devolve 404 quando não existe.
 *
 * MockMvc é montado manualmente a partir do WebApplicationContext (em vez de
 * {@code @AutoConfigureMockMvc}), mesmo padrão de BadgeControllerIT — no Spring Boot 4.1
 * a auto-configuração de MockMvc para testes foi extraída para o starter
 * {@code spring-boot-starter-webmvc-test}, não declarado no pom.xml deste projeto (fora do
 * escopo deste módulo editar pom.xml). {@code MockMvcBuilders.webAppContextSetup(...)} vem
 * do módulo {@code spring-test} puro, já presente transitivamente via
 * spring-boot-starter-test.
 *
 * NOTA (armadilha descoberta ao escrever este teste): no Spring Boot 4.1, o bean de
 * ObjectMapper autoconfigurado por {@code JacksonAutoConfiguration} é do novo Jackson 3
 * ({@code tools.jackson.databind.ObjectMapper}, via spring-boot-starter-jackson), NÃO
 * {@code com.fasterxml.jackson.databind.ObjectMapper} (Jackson 2 clássico, que só entra no
 * classpath transitivamente pelo starter de teste, sem virar bean). Por isso este teste
 * evita `@Autowired ObjectMapper` por completo: corpos de request são JSON literal
 * (String), e respostas são verificadas via {@code jsonPath(...)}, que não depende de bean
 * nenhum de Jackson.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class PostControllerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private PostRepository postRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        postRepository.deleteAll();
    }

    private Post persistPost(String name, String slug, boolean visible) {
        Post post = new Post();
        post.setName(name);
        post.setSlug(slug);
        post.setSummary("Resumo de " + name);
        post.setContent("# " + name + "\n\nConteúdo em Markdown.");
        post.setVisible(visible);
        return postRepository.save(post);
    }

    @Test
    void publicListOnlyShowsVisiblePosts() throws Exception {
        persistPost("Post Visível", "post-visivel", true);
        persistPost("Post Oculto", "post-oculto", false);

        mockMvc.perform(get("/api/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].slug").value("post-visivel"));
    }

    @Test
    void allRouteWithoutAuthIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/posts/all"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void allRouteReturnsEveryPostRegardlessOfVisibilityAndIsNotConfusedWithASlug() throws Exception {
        persistPost("Post Visível", "post-visivel", true);
        persistPost("Post Oculto", "post-oculto", false);

        // Prova de que /all foi roteado para o admin (lista com os 2 posts, visível e
        // oculto), e não interpretado como busca por slug "all" — que devolveria 404
        // (NotFoundException), não um array de 2 elementos.
        mockMvc.perform(get("/api/posts/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void findBySlugIsPublicAndReturnsThePost() throws Exception {
        persistPost("Meu Artigo", "meu-artigo", true);

        mockMvc.perform(get("/api/posts/meu-artigo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("meu-artigo"))
                .andExpect(jsonPath("$.name").value("Meu Artigo"));
    }

    @Test
    void findBySlugReturnsNotFoundWhenMissing() throws Exception {
        mockMvc.perform(get("/api/posts/nao-existe"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWithoutAuthIsUnauthorized() throws Exception {
        String body = """
                {"name":"Sem auth","slug":"sem-auth","summary":"Resumo","content":"Conteúdo"}
                """;

        mockMvc.perform(post("/api/posts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void createWithAuthPersistsPost() throws Exception {
        String body = """
                {"name":"Meu Artigo","slug":"meu-artigo","summary":"Resumo curto","content":"# Título\\n\\nConteúdo em Markdown."}
                """;

        mockMvc.perform(post("/api/posts")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("meu-artigo"))
                .andExpect(jsonPath("$.visible").value(true))
                .andExpect(jsonPath("$.featured").value(false))
                .andExpect(jsonPath("$.kanbanStatus").value("BACKLOG"));

        assertThat(postRepository.findAll()).hasSize(1);
    }

    @Test
    @WithMockUser
    void patchOfUnknownIdReturnsNotFound() throws Exception {
        String body = """
                {"name":"Novo nome"}
                """;

        mockMvc.perform(patch("/api/posts/{id}", UUID.randomUUID())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void deleteOfUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/posts/{id}", UUID.randomUUID())
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }
}
