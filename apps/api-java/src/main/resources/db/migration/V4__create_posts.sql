-- Posts/artigos de blog. Estruturalmente idêntico a projects, trocando
-- image/project_url/repo_url por image_url/content, e com busca pública por slug.
-- Equivalente à tabela posts do Nest (apps/api/src/db/schema/posts.ts).
--
-- created_at/updated_at usam TIMESTAMPTZ porque o Hibernate 6+ mapeia java.time.Instant
-- para "timestamp with time zone" por padrão (ver AuditableEntity).
CREATE TABLE posts (
    id          UUID PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    summary     VARCHAR(300) NOT NULL,
    image_url   VARCHAR(2048),
    content     TEXT NOT NULL,
    badge1_id   UUID REFERENCES badges(id) ON DELETE SET NULL,
    badge2_id   UUID REFERENCES badges(id) ON DELETE SET NULL,
    badge3_id   UUID REFERENCES badges(id) ON DELETE SET NULL,
    visible     BOOLEAN NOT NULL DEFAULT TRUE,
    featured    BOOLEAN NOT NULL DEFAULT FALSE,
    kanban_status VARCHAR(50) NOT NULL DEFAULT 'BACKLOG',
    created_at  TIMESTAMPTZ NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL
);
