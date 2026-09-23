package dev.brunogusmao.api.projects.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.UUID;

/**
 * Corpo do {@code PATCH /api/projects/{id}} — todos os campos são opcionais (atualização
 * parcial); campos nulos são ignorados pelo service e mantêm o valor atual. badge1Id/
 * badge2Id/badge3Id são UUIDs opcionais — o service resolve pra {@code Badge}.
 */
public record ProjectUpdateRequest(
        @Size(max = 255)
        String name,

        @Size(max = 255)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must contain only lowercase letters, numbers and hyphens")
        String slug,

        @Size(max = 300)
        String summary,

        @URL
        @Size(max = 2048)
        String image,

        @URL
        @Size(max = 2048)
        String projectUrl,

        @URL
        @Size(max = 2048)
        String repoUrl,

        UUID badge1Id,

        UUID badge2Id,

        UUID badge3Id,

        Boolean visible,

        Boolean featured,

        KanbanStatus kanbanStatus
) {
}
