package dev.brunogusmao.api.posts.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.UUID;

/**
 * Corpo do {@code PATCH /api/posts/{id}} — todos os campos são opcionais (atualização
 * parcial); campos nulos são ignorados pelo service e mantêm o valor atual. Atualiza por
 * {@code id}, nunca por {@code slug}.
 */
public record PostUpdateRequest(
        @Size(max = 255)
        String name,

        @Size(max = 255)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must contain only lowercase letters, numbers and hyphens")
        String slug,

        @Size(max = 300)
        String summary,

        @Size(max = 2048)
        @URL
        String imageUrl,

        String content,

        UUID badge1Id,

        UUID badge2Id,

        UUID badge3Id,

        Boolean visible,

        Boolean featured,

        KanbanStatus kanbanStatus
) {
}
