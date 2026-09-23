package dev.brunogusmao.api.badges.dto;

import dev.brunogusmao.api.badges.Badge;

import java.time.Instant;
import java.util.UUID;

public record BadgeResponse(
        UUID id,
        String name,
        String slug,
        String bgColor,
        String textColor,
        Instant createdAt
) {

    public static BadgeResponse from(Badge badge) {
        return new BadgeResponse(
                badge.getId(),
                badge.getName(),
                badge.getSlug(),
                badge.getBgColor(),
                badge.getTextColor(),
                badge.getCreatedAt()
        );
    }
}
