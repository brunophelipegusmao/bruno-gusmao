package dev.brunogusmao.api.kanban;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.brunogusmao.api.kanban.dto.CardMovePayload;
import dev.brunogusmao.api.kanban.dto.KanbanSocketMessage;
import dev.brunogusmao.api.kanbantasks.KanbanTaskService;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskUpdateRequest;
import dev.brunogusmao.api.posts.PostService;
import dev.brunogusmao.api.posts.dto.PostUpdateRequest;
import dev.brunogusmao.api.projects.ProjectService;
import dev.brunogusmao.api.projects.dto.ProjectUpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * Handler WebSocket do quadro Kanban (projects/posts/kanban-tasks) — espelha
 * apps/api/src/kanban/kanban.gateway.ts#handleMoveCard. Recebe
 * {@code {"event":"move-card","data":{"id","type","to"}}}, persiste o novo
 * {@code kanbanStatus} na entidade certa (resolvida por {@code type}) e reenvia
 * {@code {"event":"card-moved","data":...}} (mesmo payload recebido) para todos os
 * clientes conectados neste handler — sem filtro nenhum, igual ao {@code server.clients}
 * do Nest.
 *
 * <p><b>TODO (hardening futuro):</b> este handshake é público de propósito, replicando um
 * gap real já existente no Nest (`handleMoveCard` não tem nenhum guard/autenticação —
 * qualquer cliente conectado em {@code /ws/kanban} pode mover qualquer card). Não foi
 * pedido consertar isso nesta migração — mantido 1:1 por paridade — mas numa iteração
 * futura de hardening isso deveria exigir um JWT válido no handshake, no mesmo estilo do
 * {@link JwtHandshakeInterceptor} usado em {@code /ws/todos}.</p>
 */
@Component
public class KanbanWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(KanbanWebSocketHandler.class);

    // Instância própria, não um bean @Autowired: no Spring Boot 4.1.1 deste projeto, o
    // ObjectMapper autoconfigurado é do Jackson 3 (tools.jackson.databind.ObjectMapper), não
    // este tipo clássico (com.fasterxml.jackson.databind) — @Autowired aqui falharia com
    // NoSuchBeanDefinitionException (mesmo achado documentado em docs/java-migration/06-todos.md).
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();

    private final ProjectService projectService;
    private final PostService postService;
    private final KanbanTaskService kanbanTaskService;

    public KanbanWebSocketHandler(ProjectService projectService,
                                   PostService postService,
                                   KanbanTaskService kanbanTaskService) {
        this.projectService = projectService;
        this.postService = postService;
        this.kanbanTaskService = kanbanTaskService;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        KanbanSocketMessage incoming;
        try {
            incoming = objectMapper.readValue(message.getPayload(), KanbanSocketMessage.class);
        } catch (IOException e) {
            log.warn("Mensagem inválida recebida em /ws/kanban, ignorando: {}", e.getMessage());
            return;
        }

        if (incoming == null || !"move-card".equals(incoming.event()) || incoming.data() == null) {
            return; // só reagimos a "move-card", igual ao @SubscribeMessage('move-card') do Nest
        }

        CardMovePayload data = incoming.data();
        applyMove(data);
        broadcast(new KanbanSocketMessage("card-moved", data));
    }

    /**
     * Resolve pelo {@code type} qual service chamar — mesmo if/else do Nest
     * (project/post, com "task" como default para qualquer outro valor, inclusive nulo).
     */
    private void applyMove(CardMovePayload data) {
        if ("project".equals(data.type())) {
            projectService.update(data.id(), new ProjectUpdateRequest(
                    null, null, null, null, null, null, null, null, null, null, null, data.to()));
        } else if ("post".equals(data.type())) {
            postService.update(data.id(), new PostUpdateRequest(
                    null, null, null, null, null, null, null, null, null, null, data.to()));
        } else {
            kanbanTaskService.update(data.id(), new KanbanTaskUpdateRequest(
                    null, null, null, null, data.to()));
        }
    }

    private void broadcast(KanbanSocketMessage payload) {
        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao serializar mensagem do kanban", e);
        }

        TextMessage textMessage = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            if (!session.isOpen()) {
                continue;
            }
            try {
                session.sendMessage(textMessage);
            } catch (IOException e) {
                // Sessão pode ter caído entre o isOpen() e o send — ignora e segue pros
                // demais clientes, equivalente ao check de client.readyState do Nest.
                log.warn("Falha ao enviar card-moved para sessão {}, ignorando: {}", session.getId(), e.getMessage());
            }
        }
    }
}
