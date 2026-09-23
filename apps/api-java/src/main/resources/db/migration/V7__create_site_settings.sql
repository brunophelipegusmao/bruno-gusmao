-- Site Settings: linha singleton de configurações públicas do site (popup de evento).
-- Sem constraint de banco garantindo "uma única linha" — a proteção é só na aplicação
-- (padrão lazy-singleton via SiteSettingsService#getOrCreate), espelhando o Nest/Drizzle
-- (apps/api/src/db/schema/site-settings.ts), que também não tem essa garantia no schema.
CREATE TABLE site_settings (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_popup_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
    event_name           VARCHAR(100) NOT NULL DEFAULT 'Evento',
    event_description    VARCHAR(500),
    event_image_url      VARCHAR(2048),
    event_bg_color       VARCHAR(50) NOT NULL DEFAULT '#1e293b',
    event_text_color     VARCHAR(50) NOT NULL DEFAULT '#e2e8f0',
    updated_at           TIMESTAMP NOT NULL DEFAULT now()
);
