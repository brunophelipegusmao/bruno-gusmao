package dev.brunogusmao.api.todos.dto;

import dev.brunogusmao.api.todos.Todo;

import java.time.Instant;
import java.util.UUID;

public record TodoResponse(
        UUID id,
        String title,
        String description,
        boolean done,
        boolean shared,
        UUID ownerId,
        Instant createdAt,
        Instant updatedAt
) {

    public static TodoResponse fromEntity(Todo todo) {
        return new TodoResponse(
                todo.getId(),
                todo.getTitle(),
                todo.getDescription(),
                todo.isDone(),
                todo.isShared(),
                todo.getOwner().getId(),
                todo.getCreatedAt(),
                todo.getUpdatedAt()
        );
    }
}
