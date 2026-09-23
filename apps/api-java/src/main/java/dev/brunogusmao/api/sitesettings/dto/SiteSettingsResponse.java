package dev.brunogusmao.api.sitesettings.dto;

import dev.brunogusmao.api.sitesettings.SiteSettings;

/**
 * Shape de resposta pública — sem {@code id}, replicando o retorno do
 * {@code SiteSettingsController} do Nest (que nunca expõe o id da linha singleton).
 */
public record SiteSettingsResponse(
        boolean eventPopupEnabled,
        String eventName,
        String eventDescription,
        String eventImageUrl,
        String eventBgColor,
        String eventTextColor
) {

    public static SiteSettingsResponse from(SiteSettings entity) {
        return new SiteSettingsResponse(
                entity.isEventPopupEnabled(),
                entity.getEventName(),
                entity.getEventDescription(),
                entity.getEventImageUrl(),
                entity.getEventBgColor(),
                entity.getEventTextColor()
        );
    }
}
