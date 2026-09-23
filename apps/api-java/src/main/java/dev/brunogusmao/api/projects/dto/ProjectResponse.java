package dev.brunogusmao.api.projects.dto;

import dev.brunogusmao.api.badges.Badge;
import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.projects.Project;

import java.time.Instant;
import java.util.UUID;

/**
 * Shape de resposta replica o Nest: badges expandidos apenas como ids
 * (badge1Id/badge2Id/badge3Id), não como objetos completos — ver
 * apps/api/src/projects/projects.controller.ts (ProjectSchema).
 */
public record ProjectResponse(
        UUID id,
        String name,
        String slug,
        String summary,
        String image,
        String projectUrl,
        String repoUrl,
        UUID badge1Id,
        UUID badge2Id,
        UUID badge3Id,
        boolean visible,
        boolean featured,
        KanbanStatus kanbanStatus,
        Instant createdAt,
        Instant updatedAt
) {

    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getSlug(),
                project.getSummary(),
                project.getImage(),
                project.getProjectUrl(),
                project.getRepoUrl(),
                idOf(project.getBadge1()),
                idOf(project.getBadge2()),
                idOf(project.getBadge3()),
                project.isVisible(),
                project.isFeatured(),
                project.getKanbanStatus(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }

    private static UUID idOf(Badge badge) {
        return badge != null ? badge.getId() : null;
    }
}
