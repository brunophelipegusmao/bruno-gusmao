package dev.brunogusmao.api.sitesettings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Linha singleton de configurações públicas do site (popup de divulgação de evento).
 * Padrão lazy-singleton — ver {@link SiteSettingsService#getOrCreate()} — diferente de
 * todos os outros módulos, que são CRUD normal com múltiplas linhas.
 *
 * <p>O schema original (Drizzle, {@code apps/api/src/db/schema/site-settings.ts}) só tem
 * {@code updatedAt}, sem {@code createdAt}. Por isso esta entity não estende
 * {@link dev.brunogusmao.api.common.AuditableEntity} nem
 * {@link dev.brunogusmao.api.common.CreatedAtOnlyEntity} (nenhuma das duas serve) e declara
 * {@code updatedAt} diretamente.</p>
 *
 * <p><b>Escolha de implementação para updatedAt:</b> em vez de setar {@code Instant.now()}
 * manualmente no service (como o Nest faz com {@code updatedAt: new Date()} no
 * {@code .set()}), usamos {@link UpdateTimestamp} do Hibernate. Ele cobre tanto o INSERT
 * feito por {@code getOrCreate()} quanto o UPDATE feito por {@code update()} automaticamente,
 * equivalente ao {@code defaultNow()} do Drizzle + o update manual do Nest, sem duplicar essa
 * responsabilidade no service.</p>
 */
@Entity
@Table(name = "site_settings")
public class SiteSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id")
    private UUID id;

    @Column(name = "event_popup_enabled", nullable = false)
    private boolean eventPopupEnabled = false;

    @Column(name = "event_name", nullable = false, length = 100)
    private String eventName = "Evento";

    @Column(name = "event_description", length = 500)
    private String eventDescription;

    @Column(name = "event_image_url", length = 2048)
    private String eventImageUrl;

    @Column(name = "event_bg_color", nullable = false, length = 50)
    private String eventBgColor = "#1e293b";

    @Column(name = "event_text_color", nullable = false, length = 50)
    private String eventTextColor = "#e2e8f0";

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() {
        return id;
    }

    public boolean isEventPopupEnabled() {
        return eventPopupEnabled;
    }

    public void setEventPopupEnabled(boolean eventPopupEnabled) {
        this.eventPopupEnabled = eventPopupEnabled;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventDescription() {
        return eventDescription;
    }

    public void setEventDescription(String eventDescription) {
        this.eventDescription = eventDescription;
    }

    public String getEventImageUrl() {
        return eventImageUrl;
    }

    public void setEventImageUrl(String eventImageUrl) {
        this.eventImageUrl = eventImageUrl;
    }

    public String getEventBgColor() {
        return eventBgColor;
    }

    public void setEventBgColor(String eventBgColor) {
        this.eventBgColor = eventBgColor;
    }

    public String getEventTextColor() {
        return eventTextColor;
    }

    public void setEventTextColor(String eventTextColor) {
        this.eventTextColor = eventTextColor;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
