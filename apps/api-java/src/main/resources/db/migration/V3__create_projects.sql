-- Projetos do portfólio. Paridade com apps/api/src/db/schema/projects.ts (Drizzle, Nest).
-- Badge1/2/3 são três FKs opcionais separadas pra badges (não uma tabela de junção),
-- ON DELETE SET NULL: apagar um badge referenciado não bloqueia nem apaga em cascata o
-- projeto, a coluna só vira NULL (ver docs/java-migration/03-projects.md).
--
-- created_at/updated_at usam TIMESTAMPTZ porque o Hibernate 6+ mapeia java.time.Instant
-- para "timestamp with time zone" por padrão (ver AuditableEntity, mesmo padrão de
-- V5__create_kanban_tasks.sql).
CREATE TABLE projects (
    id            UUID PRIMARY KEY,
    name          VARCHAR(255) NOT NULL UNIQUE,
    slug          VARCHAR(255) NOT NULL UNIQUE,
    summary       VARCHAR(300) NOT NULL,
    image         VARCHAR(2048),
    project_url   VARCHAR(2048),
    repo_url      VARCHAR(2048),
    badge1_id     UUID REFERENCES badges (id) ON DELETE SET NULL,
    badge2_id     UUID REFERENCES badges (id) ON DELETE SET NULL,
    badge3_id     UUID REFERENCES badges (id) ON DELETE SET NULL,
    visible       BOOLEAN NOT NULL DEFAULT TRUE,
    featured      BOOLEAN NOT NULL DEFAULT FALSE,
    kanban_status VARCHAR(50) NOT NULL DEFAULT 'BACKLOG',
    created_at    TIMESTAMPTZ NOT NULL,
    updated_at    TIMESTAMPTZ NOT NULL
);
