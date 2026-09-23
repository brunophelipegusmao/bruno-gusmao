package dev.brunogusmao.api.config;

import dev.brunogusmao.api.kanban.JwtHandshakeInterceptor;
import dev.brunogusmao.api.kanban.KanbanWebSocketHandler;
import dev.brunogusmao.api.kanban.TodosWebSocketHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Registra os dois handlers WebSocket puro (sem STOMP) da API, na mesma porta HTTP
 * ({@code server.port}) — replica {@code app.useWebSocketAdapter(new WsAdapter(app))} do
 * Nest. Os paths são registrados sem o prefixo {@code /api}: como nenhum controller REST
 * usa {@code server.servlet.context-path} (cada um declara {@code @RequestMapping("/api/...")}
 * explicitamente — ver convenção #1 em docs/java-migration/00-arquitetura.md), os handlers
 * aqui ficam naturalmente fora de {@code /api}, equivalente ao {@code setGlobalPrefix('api')}
 * do Nest só afetar HTTP.
 *
 * <p>{@code /ws/kanban} não tem interceptor de autenticação (handshake público, paridade
 * 1:1 com o gap do Nest — ver {@link KanbanWebSocketHandler}); {@code /ws/todos} usa
 * {@link JwtHandshakeInterceptor} para exigir um JWT válido no cookie antes de completar o
 * upgrade.</p>
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final KanbanWebSocketHandler kanbanWebSocketHandler;
    private final TodosWebSocketHandler todosWebSocketHandler;
    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final String webUrl;

    public WebSocketConfig(KanbanWebSocketHandler kanbanWebSocketHandler,
                            TodosWebSocketHandler todosWebSocketHandler,
                            JwtHandshakeInterceptor jwtHandshakeInterceptor,
                            @Value("${app.web-url}") String webUrl) {
        this.kanbanWebSocketHandler = kanbanWebSocketHandler;
        this.todosWebSocketHandler = todosWebSocketHandler;
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
        this.webUrl = webUrl;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(kanbanWebSocketHandler, "/ws/kanban")
                .setAllowedOrigins(webUrl);

        registry.addHandler(todosWebSocketHandler, "/ws/todos")
                .addInterceptors(jwtHandshakeInterceptor)
                .setAllowedOrigins(webUrl);
    }
}
