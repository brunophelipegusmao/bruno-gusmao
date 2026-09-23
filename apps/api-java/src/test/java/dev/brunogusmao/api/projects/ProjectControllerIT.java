package dev.brunogusmao.api.projects;

import dev.brunogusmao.api.badges.Badge;
import dev.brunogusmao.api.badges.BadgeRepository;
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
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração do módulo Projects — Postgres real via Testcontainers (evita mocks
 * de banco, ver docs/java-migration/00-arquitetura.md). Cobre a matriz de autorização
 * descrita em docs/java-migration/03-projects.md: GET público só mostra visible=true,
 * GET /all exige autenticação e mostra tudo, ordenação featured DESC/createdAt ASC em
 * ambas as listagens, e PATCH/DELETE de id inexistente devolve 404.
 *
 * MockMvc é montado manualmente a partir do WebApplicationContext (mesmo padrão de
 * BadgeControllerIT).
 *
 * IMPORTANTE — ObjectMapper: o Spring Boot 4.1.1 deste projeto usa Jackson 3
 * ({@code tools.jackson.core:jackson-databind}, ver {@code spring-boot-starter-jackson})
 * como implementação padrão do {@code JacksonAutoConfiguration}; o bean autoconfigurado é
 * do tipo {@code tools.jackson.databind.ObjectMapper}, NÃO
 * {@code com.fasterxml.jackson.databind.ObjectMapper} (Jackson 2 — este só existe no
 * classpath transitivamente via springdoc/swagger-core, sem bean Spring correspondente).
 * Injetar o tipo Jackson 2 falha em runtime com
 * {@code NoSuchBeanDefinitionException} mesmo compilando sem erro — esse bug (import
 * errado de ObjectMapper) já existia em BadgeControllerIT/KanbanTaskControllerIT/
 * PostControllerIT/SiteSettingsControllerIT/TodoControllerIT antes deste módulo; não foi
 * corrigido aqui por estar fora do escopo de Projects, mas está documentado no relatório
 * final desta tarefa.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class ProjectControllerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private BadgeRepository badgeRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        // Isola cada teste — as listagens dependem de contagem/ordenação exatas.
        projectRepository.deleteAll();
        badgeRepository.deleteAll();
    }

    @Test
    void publicListOnlyShowsVisibleProjects() throws Exception {
        createProject("Visivel Um", "visivel-um", true, false);
        createProject("Invisivel", "invisivel", false, false);
        createProject("Visivel Dois", "visivel-dois", true, false);

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].slug").value(org.hamcrest.Matchers.everyItem(
                        org.hamcrest.Matchers.not(org.hamcrest.Matchers.equalTo("invisivel")))));
    }

    @Test
    void publicListOrdersFeaturedFirst() throws Exception {
        // Cria o não-destacado primeiro (createdAt menor) e o destacado depois
        // (createdAt maior) — se a ordenação fosse só por createdAt, o não-destacado
        // apareceria primeiro; featured DESC deve inverter isso.
        createProject("Normal", "normal", true, false);
        createProject("Destaque", "destaque", true, true);

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("destaque"))
                .andExpect(jsonPath("$[1].slug").value("normal"));
    }

    @Test
    void allListWithoutAuthIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/projects/all"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void allListShowsEveryProjectRegardlessOfVisibility() throws Exception {
        createProject("Visivel", "visivel", true, false);
        createProject("Invisivel", "invisivel", false, false);

        mockMvc.perform(get("/api/projects/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void createWithoutAuthIsUnauthorized() throws Exception {
        Map<String, Object> body = Map.of(
                "name", "Sem Auth",
                "slug", "sem-auth",
                "summary", "resumo curto"
        );

        mockMvc.perform(post("/api/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void createPersistsProjectWithBadges() throws Exception {
        Badge badge = badgeRepository.save(new Badge("TypeScript", "typescript", "#000", "#fff"));

        Map<String, Object> body = Map.of(
                "name", "Com Badge",
                "slug", "com-badge",
                "summary", "resumo curto",
                "badge1Id", badge.getId().toString()
        );

        mockMvc.perform(post("/api/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("com-badge"))
                .andExpect(jsonPath("$.badge1Id").value(badge.getId().toString()))
                .andExpect(jsonPath("$.visible").value(true))
                .andExpect(jsonPath("$.featured").value(false))
                .andExpect(jsonPath("$.kanbanStatus").value("BACKLOG"));
    }

    @Test
    @WithMockUser
    void createWithInvalidSlugIsBadRequest() throws Exception {
        Map<String, Object> body = Map.of(
                "name", "Slug Invalido",
                "slug", "Slug Com Espaco",
                "summary", "resumo curto"
        );

        mockMvc.perform(post("/api/projects")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void patchOfUnknownIdReturnsNotFound() throws Exception {
        Map<String, Object> body = Map.of("name", "Novo nome");

        mockMvc.perform(patch("/api/projects/{id}", UUID.randomUUID())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void deleteOfUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/projects/{id}", UUID.randomUUID())
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void patchTogglesVisibility() throws Exception {
        Project project = createProject("Alterna", "alterna", true, false);

        mockMvc.perform(patch("/api/projects/{id}", project.getId())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("visible", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visible").value(false));
    }

    private Project createProject(String name, String slug, boolean visible, boolean featured) {
        Project project = new Project();
        project.setName(name);
        project.setSlug(slug);
        project.setSummary("Resumo de " + name);
        project.setVisible(visible);
        project.setFeatured(featured);
        return projectRepository.save(project);
    }
}
