package dev.brunogusmao.api.kanbantasks.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.kanbantasks.TaskType;
import jakarta.validation.constraints.Size;

/**
 * Corpo do {@code PATCH /api/kanban-tasks/{id}} — todos os campos são opcionais
 * (atualização parcial); campos nulos são ignorados pelo service e mantêm o valor atual.
 */
public record KanbanTaskUpdateRequest(
        @Size(max = 255)
        String title,

        @Size(max = 1000)
        String description,

        TaskType taskType,

        @Size(max = 50)
        String color,

        KanbanStatus kanbanStatus
) {
}
