package dev.brunogusmao.api.sitesettings;

import dev.brunogusmao.api.sitesettings.dto.SiteSettingsUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Padrão lazy-singleton: a tabela {@code site_settings} nunca deveria ter mais de uma linha,
 * mas isso não é garantido por constraint de banco (ver V7__create_site_settings.sql) — a
 * mesma confiança "nível zero de proteção no schema" que o Nest já tem hoje. Toda leitura e
 * escrita passa por {@link #getOrCreate()}, que garante a linha antes de qualquer operação.
 */
@Service
public class SiteSettingsService {

    private final SiteSettingsRepository repository;

    public SiteSettingsService(SiteSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public SiteSettings getOrCreate() {
        return repository.findAll().stream()
                .findFirst()
                .orElseGet(() -> repository.save(new SiteSettings()));
    }

    @Transactional
    public SiteSettings update(SiteSettingsUpdateRequest request) {
        SiteSettings settings = getOrCreate();

        if (request.eventPopupEnabled() != null) {
            settings.setEventPopupEnabled(request.eventPopupEnabled());
        }
        if (request.eventName() != null) {
            settings.setEventName(request.eventName());
        }
        if (request.eventDescription() != null) {
            settings.setEventDescription(request.eventDescription());
        }
        if (request.eventImageUrl() != null) {
            settings.setEventImageUrl(request.eventImageUrl());
        }
        if (request.eventBgColor() != null) {
            settings.setEventBgColor(request.eventBgColor());
        }
        if (request.eventTextColor() != null) {
            settings.setEventTextColor(request.eventTextColor());
        }

        return repository.save(settings);
    }
}
