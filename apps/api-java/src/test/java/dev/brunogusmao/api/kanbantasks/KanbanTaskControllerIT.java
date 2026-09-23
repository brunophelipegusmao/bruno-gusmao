package dev.brunogusmao.api.kanbantasks;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskCreateRequest;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste de integração do módulo kanban-tasks — GET é público; POST/PATCH/DELETE exigem
 * autenticação; PATCH/DELETE de id inexistente retornam 404.
 *
 * Usa {@link HttpClient} puro (JDK) em vez de MockMvc/TestRestTemplate: no checkout em
 * que este teste foi escrito, {@code spring-boot-test-autoconfigure:4.1.1} publicado no
 * Maven Central NÃO contém mais os pacotes {@code web/servlet} (MockMvc) nem
 * {@code TestRestTemplate} — no Spring Boot 4.1 eles foram modularizados para os
 * artefatos separados {@code spring-boot-webmvc-test} / {@code spring-boot-resttestclient}
 * (confirmado inspecionando o jar real e o repositório do spring-boot na tag v4.1.1).
 * Adicionar essas dependências exigiria editar {@code pom.xml}, que está fora do escopo
 * deste módulo (instrução explícita: não editar {@code apps/api-java/pom.xml}). HttpClient
 * do JDK não precisa de nenhuma dependência extra.
 *
 * NOTA: no momento em que este teste foi escrito, o módulo Auth (SecurityConfig) ainda
 * não existia neste checkout — está sendo implementado em paralelo por outro agente (ver
 * docs/java-migration/00-arquitetura.md). Sem SecurityConfig, o Spring Boot ativa a
 * segurança padrão (httpBasic/formLogin com senha gerada), então o assert de GET público
 * pode falhar até o módulo Auth ser mesclado; os asserts de 401 em POST/PATCH/DELETE sem
 * credenciais continuam válidos de qualquer forma. Quando SecurityConfig existir, este
 * teste deve rodar sem alterações.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class KanbanTaskControllerIT {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @LocalServerPort
    private int port;

    // Não é @Autowired de propósito: no Spring Boot 4.1.1 deste projeto, o bean autoconfigurado
    // de ObjectMapper é do Jackson 3 (tools.jackson.databind.ObjectMapper), não deste tipo
    // clássico (com.fasterxml.jackson.databind), que só está no classpath transitivamente (via
    // springdoc/swagger-core) sem virar bean Spring — @Autowired aqui falharia com
    // NoSuchBeanDefinitionException. Instanciar direto evita o problema (ver docs/java-migration/06-todos.md).
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private KanbanTaskRepository kanbanTaskRepository;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/kanban-tasks";
    }

    @Test
    void listIsPublic() throws IOException, InterruptedException {
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(baseUrl)).GET());

        assertThat(response.statusCode()).isEqualTo(200);
        List<?> body = objectMapper.readValue(response.body(), List.class);
        assertThat(body).hasSize(kanbanTaskRepository.findAll().size());
    }

    @Test
    void createWithoutAuthIsRejected() throws IOException, InterruptedException {
        var request = new KanbanTaskCreateRequest("Sem auth", null, null, null, null);

        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(baseUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(request))));

        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void updateNonExistentWithoutAuthIsRejectedBeforeNotFound() throws IOException, InterruptedException {
        var request = new KanbanTaskUpdateRequest("Novo título", null, null, null, null);

        // Sem credenciais: deve barrar em 401 antes mesmo de chegar no 404 do service.
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(baseUrl + "/" + UUID.randomUUID()))
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(request))));

        assertThat(response.statusCode()).isEqualTo(401);
    }

    @Test
    void deleteWithoutAuthIsRejected() throws IOException, InterruptedException {
        HttpResponse<String> response = send(HttpRequest.newBuilder(URI.create(baseUrl + "/" + UUID.randomUUID()))
                .DELETE());

        assertThat(response.statusCode()).isEqualTo(401);
    }

    private HttpResponse<String> send(HttpRequest.Builder builder) throws IOException, InterruptedException {
        return httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
    }
}
