package dev.brunogusmao.api.todos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corpo do {@code POST /api/todos}. De propósito, NÃO tem campo {@code ownerId} — o dono
 * é sempre o usuário autenticado (ver {@code TodoService#create}), nunca algo vindo do
 * client (ver 06-todos.md, "Escrita — owner nunca vem do client").
 */
public record TodoCreateRequest(
        @NotBlank
        @Size(max = 255)
        String title,

        @Size(max = 1000)
        String description,

        Boolean shared
) {
}
