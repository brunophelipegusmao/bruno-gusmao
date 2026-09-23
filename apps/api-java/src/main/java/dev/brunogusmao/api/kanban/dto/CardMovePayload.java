package dev.brunogusmao.api.kanban.dto;

import dev.brunogusmao.api.common.KanbanStatus;

import java.util.UUID;

/**
 * Corpo de {@code data} nas mensagens {@code move-card}/{@code card-moved} do WebSocket do
 * kanban — espelha {@code MoveCardDto} em apps/api/src/kanban/kanban.gateway.ts.
 * {@code type} é uma string livre ("project"|"post"|"task") em vez de enum de propósito:
 * o Nest também trata como union de string literal simples, sem validação estrita no
 * gateway (qualquer valor que não seja "project"/"post" cai no branch de "task", igual ao
 * {@code else} do Nest — ver {@link dev.brunogusmao.api.kanban.KanbanWebSocketHandler}).
 */
public record CardMovePayload(UUID id, String type, KanbanStatus to) {
}
