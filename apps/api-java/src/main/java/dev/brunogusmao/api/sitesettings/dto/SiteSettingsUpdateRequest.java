package dev.brunogusmao.api.sitesettings.dto;

import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;

/**
 * Todos os campos são opcionais — merge parcial aplicado em
 * {@code SiteSettingsService#update}. Equivalente ao
 * {@code updateSiteSettingsSchema = insertSiteSettingsSchema.partial()} do Zod no Nest.
 *
 * <p>Nota de paridade: como este é um record simples (campo ausente e campo explicitamente
 * {@code null} não são distinguíveis), um {@code null} em {@code eventDescription}/
 * {@code eventImageUrl} é tratado como "não alterar" em vez de "limpar o campo". O Nest,
 * via Zod {@code .nullable()}, permite limpar esses dois campos explicitamente com
 * {@code null}. Essa é uma simplificação documentada — não há endpoint hoje que dependa de
 * limpar esses campos via PATCH.</p>
 */
public record SiteSettingsUpdateRequest(
        Boolean eventPopupEnabled,
        @Size(min = 1, max = 100) String eventName,
        @Size(max = 500) String eventDescription,
        @URL @Size(max = 2048) String eventImageUrl,
        @Size(min = 1, max = 50) String eventBgColor,
        @Size(min = 1, max = 50) String eventTextColor
) {
}
