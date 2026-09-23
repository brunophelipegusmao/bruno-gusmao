package dev.brunogusmao.api.sitesettings;

import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração do módulo Site Settings — Postgres real via Testcontainers (evita
 * mocks de banco, ver docs/java-migration/00-arquitetura.md).
 *
 * Cobre o padrão singleton descrito em docs/java-migration/07-site-settings.md: primeiro
 * GET cria a linha com defaults, GETs subsequentes reusam a mesma linha (não duplicam),
 * PATCH sem auth devolve 401, PATCH com auth atualiza e persiste.
 *
 * Requests autenticadas usam {@code @WithMockUser} (injeta a Authentication direto no
 * SecurityContext do MockMvc), igual ao padrão já usado em BadgeControllerIT — independe
 * de como o módulo Auth emite/valida o JWT de verdade.
 *
 * Observação: como este módulo foi implementado antes (ou em paralelo) do módulo Auth,
 * getFirstCallCreatesRowWithDefaults() pode falhar temporariamente com 401 em vez de 200
 * se SecurityConfig ainda não existir — sem ela, a autoconfiguração padrão do Spring
 * Security protege TODAS as rotas. Isso é esperado e deve se resolver assim que o módulo
 * Auth publicar SecurityConfig.java com a matriz de docs/java-migration/00-arquitetura.md
 * (que já lista GET /api/site-settings como permitAll).
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class SiteSettingsControllerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    // @AutoConfigureMockMvc não estava aplicando o suporte de teste do Spring Security
    // corretamente nesta combinação Boot 4.1.1/Security 7 — @WithMockUser não populava o
    // SecurityContext da request (causava 401 em vez de 200 em PATCHs autenticados). Montar
    // o MockMvc manualmente com springSecurity(), igual aos outros módulos, resolve.
    //
    // repository.deleteAll(): a tabela site_settings é um singleton (uma linha só) e os 4
    // testes desta classe compartilham o mesmo banco Testcontainers sem @DirtiesContext — sem
    // limpar entre testes, a ordem (não garantida pelo JUnit) faz um teste ver a linha já
    // mutada por outro (ex.: getFirstCallCreatesRowWithDefaults rodando depois de
    // patchWithAuthUpdatesAndPersists encontraria eventPopupEnabled=true, não o default).
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        repository.deleteAll();
    }

    // Não é @Autowired de propósito: no Spring Boot 4.1.1 deste projeto, o bean autoconfigurado
    // de ObjectMapper é do Jackson 3 (tools.jackson.databind.ObjectMapper), não deste tipo
    // clássico (com.fasterxml.jackson.databind), que só está no classpath transitivamente (via
    // springdoc/swagger-core) sem virar bean Spring — @Autowired aqui falharia com
    // NoSuchBeanDefinitionException. Instanciar direto evita o problema (ver docs/java-migration/06-todos.md).
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private SiteSettingsRepository repository;

    @Test
    void getFirstCallCreatesRowWithDefaults() throws Exception {
        mockMvc.perform(get("/api/site-settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.eventPopupEnabled").value(false))
                .andExpect(jsonPath("$.eventName").value("Evento"))
                .andExpect(jsonPath("$.eventBgColor").value("#1e293b"))
                .andExpect(jsonPath("$.eventTextColor").value("#e2e8f0"));

        assertThat(repository.findAll()).hasSize(1);
    }

    @Test
    void subsequentGetsReuseTheSameRow() throws Exception {
        mockMvc.perform(get("/api/site-settings")).andExpect(status().isOk());
        mockMvc.perform(get("/api/site-settings")).andExpect(status().isOk());
        mockMvc.perform(get("/api/site-settings")).andExpect(status().isOk());

        assertThat(repository.findAll()).hasSize(1);
    }

    @Test
    void patchWithoutAuthIsUnauthorized() throws Exception {
        Map<String, Object> body = Map.of("eventPopupEnabled", true);

        mockMvc.perform(patch("/api/site-settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void patchWithAuthUpdatesAndPersists() throws Exception {
        Map<String, Object> body = Map.of(
                "eventPopupEnabled", true,
                "eventName", "Evento Especial"
        );

        mockMvc.perform(patch("/api/site-settings")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.eventPopupEnabled").value(true))
                .andExpect(jsonPath("$.eventName").value("Evento Especial"))
                // campos não enviados no PATCH permanecem com o default
                .andExpect(jsonPath("$.eventBgColor").value("#1e293b"));

        assertThat(repository.findAll()).hasSize(1);
        SiteSettings persisted = repository.findAll().get(0);
        assertThat(persisted.isEventPopupEnabled()).isTrue();
        assertThat(persisted.getEventName()).isEqualTo("Evento Especial");
    }
}
