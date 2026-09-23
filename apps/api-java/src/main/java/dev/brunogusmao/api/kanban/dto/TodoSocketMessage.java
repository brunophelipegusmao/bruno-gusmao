package dev.brunogusmao.api.kanban.dto;

import dev.brunogusmao.api.todos.dto.TodoResponse;

/**
 * Envelope {@code {event, data}} emitido em {@code /ws/todos} — espelha o broadcast de
 * apps/api/src/todos/todos.gateway.ts#broadcast. {@code event} é um dos três literais
 * {@code todo-created}/{@code todo-updated}/{@code todo-deleted}.
 */
public record TodoSocketMessage(String event, TodoResponse data) {
}
