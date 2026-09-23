package dev.brunogusmao.api.kanban;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import dev.brunogusmao.api.kanban.dto.TodoSocketMessage;
import dev.brunogusmao.api.todos.dto.TodoResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Handler WebSocket de Todos — espelha apps/api/src/todos/todos.gateway.ts. O handshake é
 * autenticado por {@link JwtHandshakeInterceptor} (registrado em
 * {@code dev.brunogusmao.api.config.WebSocketConfig}), que grava o {@code userId} do JWT em
 * {@code session.getAttributes()}; conexões sem JWT válido nunca chegam a se estabelecer.
 *
 * <p>Broadcast é filtrado por sessão: só recebe o evento quem é dono do todo ou o todo é
 * compartilhado (mesmo filtro de {@code TodosGateway#broadcast} no Nest). É chamado por
 * {@link dev.brunogusmao.api.todos.TodoService} ao final de create/update/remove — ver
 * javadoc de {@link #broadcast(String, TodoResponse)} para a decisão de injeção.</p>
 */
@Component
public class TodosWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(TodosWebSocketHandler.class);

    // Instância própria (não @Autowired) pelo mesmo motivo documentado em
    // KanbanWebSocketHandler: o ObjectMapper autoconfigurado do Spring Boot 4.1.1 é Jackson 3
    // (tools.jackson.databind), não este tipo clássico. Registra JavaTimeModule porque, ao
    // contrário do payload do kanban (sem datas), TodoResponse tem createdAt/updatedAt
    // (Instant) — sem o módulo, a serialização desses campos falha/quebra o formato.
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        // Essencial remover no close: sem isso o broadcast tentaria mandar mensagem pra
        // sessões mortas depois de uma desconexão/reconexão (ver nota de paridade em
        // docs/java-migration/08-kanban-websocket.md).
        sessions.remove(session);
    }

    /**
     * Chamado por {@link dev.brunogusmao.api.todos.TodoService} ao final de
     * create/update/remove.
     *
     * <p><b>Decisão de design:</b> {@code TodoService} recebe este handler por injeção de
     * construtor comum, sem {@code @Lazy}. Não há ciclo de beans real a evitar: este handler
     * depende apenas de infraestrutura própria (sessões, ObjectMapper) — nada aqui referencia
     * {@code TodoService} de volta —, então o grafo de beans do Spring permanece acíclico
     * mesmo com {@code TodoService -> TodosWebSocketHandler}. O único "ciclo" que existe é a
     * nível de pacote Java ({@code todos} passa a importar {@code kanban.TodosWebSocketHandler}
     * e {@code kanban} já importa {@code todos.dto.TodoResponse}), o que o Java permite sem
     * problema — mesmo padrão do Nest, onde {@code TodosGateway} é injetado direto em
     * {@code TodosService} sem nenhum truque de lazy-loading.</p>
     */
    public void broadcast(String event, TodoResponse todo) {
        String json;
        try {
            json = objectMapper.writeValueAsString(new TodoSocketMessage(event, todo));
        } catch (IOException e) {
            throw new IllegalStateException("Falha ao serializar mensagem de todos", e);
        }

        TextMessage textMessage = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            if (!session.isOpen()) {
                continue;
            }

            UUID sessionUserId = (UUID) session.getAttributes().get("userId");
            boolean canSee = todo.shared() || todo.ownerId().equals(sessionUserId);
            if (!canSee) {
                continue;
            }

            try {
                session.sendMessage(textMessage);
            } catch (IOException e) {
                log.warn("Falha ao enviar {} para sessão {}, ignorando: {}", event, session.getId(), e.getMessage());
            }
        }
    }
}
