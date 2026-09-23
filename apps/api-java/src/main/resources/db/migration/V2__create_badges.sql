-- Badges de tecnologia (ex.: "TypeScript", "Docker"), usadas em projects/posts.
-- Paridade com apps/api/src/db/schema/badges.ts (Drizzle, Nest). Sem updatedAt.
CREATE TABLE badges (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(100) NOT NULL UNIQUE,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    bg_color   VARCHAR(50) NOT NULL DEFAULT '#1e293b',
    text_color VARCHAR(50) NOT NULL DEFAULT '#e2e8f0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
