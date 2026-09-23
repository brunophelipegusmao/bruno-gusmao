package dev.brunogusmao.api.badges;

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
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração do módulo Badges — Postgres real via Testcontainers (evita mocks
 * de banco, ver docs/java-migration/00-arquitetura.md). Cobre a matriz de autorização
 * descrita em docs/java-migration/02-badges.md: GET público, POST/PATCH/DELETE exigem
 * sessão, PATCH/DELETE de id inexistente devolve 404.
 *
 * MockMvc é montado manualmente a partir do WebApplicationContext (em vez de
 * {@code @AutoConfigureMockMvc}) porque, no Spring Boot 4.1, a auto-configuração de
 * MockMvc para testes foi extraída para o módulo {@code spring-boot-webmvc-test} /
 * starter {@code spring-boot-starter-webmvc-test}, que não está declarado no pom.xml
 * deste projeto (não foi adicionado aqui por instrução explícita de não editar o
 * pom.xml). {@code MockMvcBuilders.webAppContextSetup(...)} vem do módulo {@code spring-test}
 * puro, já presente transitivamente via spring-boot-starter-test.
 *
 * Requests autenticadas usam {@code @WithMockUser}, que injeta a Authentication
 * diretamente no SecurityContext do MockMvc — independe de como o módulo Auth emite/
 * valida o JWT de verdade (SecurityConfig); o que importa aqui é só a regra de
 * autorização (.authenticated()) aplicada às rotas de escrita.
 *
 * Observação: como este módulo (Badges) foi implementado antes do módulo Auth
 * (SecurityConfig ainda não existe no momento em que este teste foi escrito), o teste
 * getIsPublic() pode falhar temporariamente com 401/403 em vez de 200 — sem
 * SecurityConfig, a autoconfiguração padrão do Spring Security protege TODAS as rotas.
 * Isso é esperado e deve se resolver assim que o módulo Auth publicar
 * SecurityConfig.java com a matriz de docs/java-migration/00-arquitetura.md.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
class BadgeControllerIT {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres = new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private WebApplicationContext webApplicationContext;

    // Não é @Autowired de propósito: no Spring Boot 4.1.1 deste projeto, o bean autoconfigurado
    // de ObjectMapper é do Jackson 3 (tools.jackson.databind.ObjectMapper), não deste tipo
    // clássico (com.fasterxml.jackson.databind), que só está no classpath transitivamente (via
    // springdoc/swagger-core) sem virar bean Spring — @Autowired aqui falharia com
    // NoSuchBeanDefinitionException. Instanciar direto evita o problema (ver docs/java-migration/06-todos.md).
    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void getIsPublic() throws Exception {
        mockMvc.perform(get("/api/badges"))
                .andExpect(status().isOk());
    }

    @Test
    void postWithoutAuthIsUnauthorized() throws Exception {
        Map<String, String> body = Map.of("name", "TypeScript", "slug", "typescript");

        mockMvc.perform(post("/api/badges")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void patchOfUnknownIdReturnsNotFound() throws Exception {
        Map<String, String> body = Map.of("name", "Novo nome");

        mockMvc.perform(patch("/api/badges/{id}", UUID.randomUUID())
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void deleteOfUnknownIdReturnsNotFound() throws Exception {
        mockMvc.perform(delete("/api/badges/{id}", UUID.randomUUID())
                        .with(csrf()))
                .andExpect(status().isNotFound());
    }
}
