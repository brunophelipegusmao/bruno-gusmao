package dev.brunogusmao.api.kanban;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.kanbantasks.KanbanTask;
import dev.brunogusmao.api.kanbantasks.KanbanTaskRepository;
import dev.brunogusmao.api.kanbantasks.TaskType;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Teste de integração ponta a ponta do handler WebSocket do kanban (checklist de
 * docs/java-migration/08-kanban-websocket.md): conectar em {@code /ws/kanban}, mandar
 * {@code move-card}, confirmar que o {@code kanbanStatus} é persistido de verdade no
 * Postgres (Testcontainers, mesmo padrão dos outros módulos) e que o broadcast de
 * {@code card-moved} chega a TODOS os clientes conectados, não só a quem enviou a
 * mensagem — sem autenticação nenhuma no handshake, de propósito (paridade com o gap do
 * Nest, ver {@link KanbanWebSocketHandler}).
 *
 * Roda via {@code ./mvnw verify} (Failsafe, convenção {@code *IT.java} deste projeto — ver
 * docs/java-migration/00-arquitetura.md); {@code ./mvnw test} ignoraria esta classe
 * silenciosamente.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class KanbanWebSocketIT {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    @LocalServerPort
    private int port;

    @Autowired
    private KanbanTaskRepository kanbanTaskRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final StandardWebSocketClient webSocketClient = new StandardWebSocketClient();

    private final List<WebSocketSession> openSessions = new ArrayList<>();

    private UUID taskId;

    @BeforeEach
    void setUp() {
        KanbanTask task = new KanbanTask();
        task.setTitle("Tarefa de teste do WS");
        task.setTaskType(TaskType.BLOG);
        task.setKanbanStatus(KanbanStatus.BACKLOG);
        taskId = kanbanTaskRepository.save(task).getId();
    }

    @AfterEach
    void tearDown() {
        for (WebSocketSession session : openSessions) {
            try {
                if (session.isOpen()) {
                    session.close();
                }
            } catch (Exception ignored) {
                // limpeza best-effort
            }
        }
        openSessions.clear();
    }

    @Test
    void moveCardPersistsAndBroadcastsCardMovedToAllConnectedClients() throws Exception {
        RecordingHandler senderHandler = new RecordingHandler();
        RecordingHandler observerHandler = new RecordingHandler();

        WebSocketSession sender = connect(senderHandler);
        connect(observerHandler); // mantida aberta só para receber o broadcast

        String moveCardMessage = """
                {"event":"move-card","data":{"id":"%s","type":"task","to":"IN_PROGRESS"}}
                """.formatted(taskId);
        sender.sendMessage(new TextMessage(moveCardMessage));

        // Ambos os clientes conectados devem receber o broadcast — inclusive quem enviou.
        String senderReceived = senderHandler.messages.poll(5, TimeUnit.SECONDS);
        String observerReceived = observerHandler.messages.poll(5, TimeUnit.SECONDS);

        assertThat(senderReceived).isNotNull();
        assertThat(observerReceived).isNotNull();

        for (String received : List.of(senderReceived, observerReceived)) {
            JsonNode json = objectMapper.readTree(received);
            assertThat(json.get("event").asText()).isEqualTo("card-moved");
            assertThat(json.get("data").get("id").asText()).isEqualTo(taskId.toString());
            assertThat(json.get("data").get("type").asText()).isEqualTo("task");
            assertThat(json.get("data").get("to").asText()).isEqualTo("IN_PROGRESS");
        }

        // Persistência real no Postgres — não só o eco da mensagem.
        Optional<KanbanTask> persisted = kanbanTaskRepository.findById(taskId);
        assertThat(persisted).isPresent();
        assertThat(persisted.get().getKanbanStatus()).isEqualTo(KanbanStatus.IN_PROGRESS);
    }

    @Test
    void handshakeRequiresNoAuthentication() throws Exception {
        // Paridade intencional com o gap do Nest: nenhum cookie/header é enviado e a
        // conexão ainda assim se estabelece com sucesso.
        RecordingHandler handler = new RecordingHandler();
        WebSocketSession session = connect(handler);

        assertThat(session.isOpen()).isTrue();
    }

    private WebSocketSession connect(TextWebSocketHandler handler) throws Exception {
        WebSocketSession session = webSocketClient
                .execute(handler, "ws://localhost:" + port + "/ws/kanban")
                .get(5, TimeUnit.SECONDS);
        openSessions.add(session);
        return session;
    }

    private static class RecordingHandler extends TextWebSocketHandler {

        private final BlockingQueue<String> messages = new ArrayBlockingQueue<>(10);

        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) {
            messages.offer(message.getPayload());
        }

        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) {
            // nada a fazer — falhas de transporte aparecem como timeout no poll() do teste
        }

        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) {
            // nada a fazer
        }
    }
}
