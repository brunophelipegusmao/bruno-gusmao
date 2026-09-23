package dev.brunogusmao.api.badges.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * bgColor/textColor são opcionais — o {@code BadgeService} aplica os defaults
 * (#1e293b / #e2e8f0) quando vierem nulos, replicando o default do Drizzle.
 */
public record BadgeCreateRequest(
        @NotBlank @Size(max = 100) String name,

        @NotBlank
        @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must contain only lowercase letters, numbers and hyphens")
        String slug,

        @Size(max = 50) String bgColor,

        @Size(max = 50) String textColor
) {
}
