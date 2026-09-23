package dev.brunogusmao.api.kanbantasks.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.kanbantasks.TaskType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Corpo do {@code POST /api/kanban-tasks}. {@code taskType} e {@code kanbanStatus} são
 * opcionais — o service aplica os defaults {@code BLOG}/{@code BACKLOG} quando nulos,
 * espelhando os {@code .default(...)} do schema Drizzle original.
 */
public record KanbanTaskCreateRequest(
        @NotBlank
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
