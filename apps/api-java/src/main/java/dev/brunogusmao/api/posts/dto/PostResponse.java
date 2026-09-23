package dev.brunogusmao.api.posts.dto;

import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.posts.Post;

import java.time.Instant;
import java.util.UUID;

public record PostResponse(
        UUID id,
        String name,
        String slug,
        String summary,
        String imageUrl,
        String content,
        UUID badge1Id,
        UUID badge2Id,
        UUID badge3Id,
        boolean visible,
        boolean featured,
        KanbanStatus kanbanStatus,
        Instant createdAt,
        Instant updatedAt
) {

    public static PostResponse from(Post post) {
        return new PostResponse(
                post.getId(),
                post.getName(),
                post.getSlug(),
                post.getSummary(),
                post.getImageUrl(),
                post.getContent(),
                post.getBadge1() != null ? post.getBadge1().getId() : null,
                post.getBadge2() != null ? post.getBadge2().getId() : null,
                post.getBadge3() != null ? post.getBadge3().getId() : null,
                post.isVisible(),
                post.isFeatured(),
                post.getKanbanStatus(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}
