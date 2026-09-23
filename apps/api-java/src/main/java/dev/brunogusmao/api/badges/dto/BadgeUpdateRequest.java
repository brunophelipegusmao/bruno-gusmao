package dev.brunogusmao.api.badges.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Todos os campos opcionais — merge parcial feito no {@code BadgeService}. Sem
 * {@code @NotBlank}: um campo ausente (null) significa "não alterar", não "vazio".
 */
public record BadgeUpdateRequest(
        @Size(max = 100) String name,

        @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "slug must contain only lowercase letters, numbers and hyphens")
        String slug,

        @Size(max = 50) String bgColor,

        @Size(max = 50) String textColor
) {
}
