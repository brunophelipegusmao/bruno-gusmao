package dev.brunogusmao.api.kanbantasks.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.kanbantasks.KanbanTask;
import dev.brunogusmao.api.kanbantasks.TaskType;

import java.time.Instant;
import java.util.UUID;

public record KanbanTaskResponse(
        UUID id,
        String title,
        String description,
        TaskType taskType,
        String color,
        KanbanStatus kanbanStatus,
        Instant createdAt,
        Instant updatedAt
) {

    public static KanbanTaskResponse fromEntity(KanbanTask task) {
        return new KanbanTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getTaskType(),
                task.getColor(),
                task.getKanbanStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
