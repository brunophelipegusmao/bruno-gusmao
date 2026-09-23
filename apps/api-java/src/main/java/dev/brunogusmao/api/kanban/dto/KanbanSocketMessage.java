package dev.brunogusmao.api.kanban.dto;

/**
 * Envelope {@code {event, data}} comum às mensagens do WebSocket do kanban — tanto a
 * recebida ({@code move-card}) quanto a emitida em broadcast ({@code card-moved}), que
 * reenvia exatamente o mesmo {@code data} recebido (ver kanban.gateway.ts#handleMoveCard).
 */
public record KanbanSocketMessage(String event, CardMovePayload data) {
}
