package dev.brunogusmao.api.projects.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

import java.util.UUID;

/**
 * Corpo do {@code POST /api/projects}. badge1Id/badge2Id/badge3Id são UUIDs opcionais
 * (não referência direta à entity) — o service resolve pra {@code Badge} via
 * {@code BadgeRepository}. {@code visible}/{@code featured}/{@code kanbanStatus} são
 * opcionais — o service aplica os defaults (true/false/BACKLOG) quando nulos, espelhando
 * os {@code .default(...)} do schema Drizzle original.
 */
public record ProjectCreateRequest(
        @NotBlank
        @Size(max = 255)
        String name,

        @NotBlank
        @Size(max = 255)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must contain only lowercase letters, numbers and hyphens")
        String slug,

        @NotBlank
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
