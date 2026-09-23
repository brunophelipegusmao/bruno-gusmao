package dev.brunogusmao.api.todos.dto;

import jakarta.validation.constraints.Size;

/**
 * Corpo do {@code PATCH /api/todos/{id}} — todos os campos são opcionais (merge parcial).
 * {@code shared}/{@code done} usam o wrapper {@code Boolean} (não {@code boolean}) de
 * propósito: precisa distinguir "campo omitido" (null, não altera nada) de "enviado como
 * false" — um {@code boolean} primitivo sempre desserializaria ausência como {@code false}
 * e resetaria o campo silenciosamente em PATCHs parciais (ver 06-todos.md).
 */
public record TodoUpdateRequest(
        @Size(max = 255)
        String title,

        @Size(max = 1000)
        String description,

        Boolean done,

        Boolean shared
) {
}
