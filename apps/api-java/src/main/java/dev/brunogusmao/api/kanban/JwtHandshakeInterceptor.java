package dev.brunogusmao.api.kanban;

import com.nimbusds.jwt.JWTClaimsSet;
import dev.brunogusmao.api.auth.AppSecurityProperties;
import dev.brunogusmao.api.auth.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;

/**
 * Recusa o handshake de {@code /ws/todos} se não houver um JWT válido no cookie —
 * equivalente ao {@code client.close(1008, 'Unauthorized')} feito em
 * {@code handleConnection} de apps/api/src/todos/todos.gateway.ts, só que aqui a recusa
 * acontece antes do upgrade HTTP→WebSocket se completar (retornando {@code false}), em vez
 * de aceitar a conexão e fechá-la em seguida — resultado equivalente para o cliente (a
 * conexão nunca fica utilizável), mas evita o handshake OK seguido de close.
 *
 * <p>Reusa exatamente o mesmo mecanismo de leitura/verificação do resto da API: o nome do
 * cookie vem de {@link AppSecurityProperties#getJwtCookieName()} (mesma propriedade que
 * {@code CookieBearerTokenResolver} usa no Resource Server HTTP) e a verificação de
 * assinatura/expiração usa {@link JwtService#verify(String)} — o mesmo HMAC/HS256 que o
 * bean {@code JwtDecoder} de {@code SecurityConfig} usa, só que utilizável fora da filter
 * chain do Spring Security (que não participa do handshake de WebSocket puro).</p>
 */
@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtHandshakeInterceptor.class);

    private final JwtService jwtService;
    private final AppSecurityProperties properties;

    public JwtHandshakeInterceptor(JwtService jwtService, AppSecurityProperties properties) {
        this.jwtService = jwtService;
        this.properties = properties;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                    WebSocketHandler wsHandler, Map<String, Object> attributes) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        String token = readJwtCookie(servletRequest.getServletRequest());
        if (token == null) {
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        try {
            JWTClaimsSet claims = jwtService.verify(token);
            UUID userId = UUID.fromString(claims.getSubject());
            attributes.put("userId", userId);
            return true;
        } catch (Exception e) {
            // Assinatura inválida, token expirado, ou "sub" não é um UUID válido — todos
            // tratados igual: handshake recusado com 401 (equivalente ao 1008 do Nest).
            log.debug("Handshake recusado em /ws/todos: JWT inválido ({})", e.getMessage());
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                WebSocketHandler wsHandler, Exception exception) {
        // nada a fazer
    }

    private String readJwtCookie(HttpServletRequest servletRequest) {
        Cookie[] cookies = servletRequest.getCookies();
        if (cookies == null) {
            return null;
        }

        return Arrays.stream(cookies)
                .filter(cookie -> properties.getJwtCookieName().equals(cookie.getName()))
                .map(Cookie::getValue)
                .filter(value -> value != null && !value.isBlank())
                .findFirst()
                .orElse(null);
    }
}
