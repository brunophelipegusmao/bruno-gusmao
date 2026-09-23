-- Módulo kanban-tasks — tarefas standalone do quadro Kanban do painel.
-- Sem FK para badges/projects: taskType é só metadado visual (ver
-- docs/java-migration/05-kanban-tasks.md). Equivalente à tabela kanban_tasks do Nest
-- (apps/api/src/db/schema/kanban-tasks.ts).
--
-- created_at/updated_at usam TIMESTAMPTZ porque o Hibernate 6+ mapeia java.time.Instant
-- para "timestamp with time zone" por padrão (ver AuditableEntity).
CREATE TABLE kanban_tasks (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    task_type VARCHAR(50) NOT NULL DEFAULT 'BLOG',
    color VARCHAR(50),
    kanban_status VARCHAR(50) NOT NULL DEFAULT 'BACKLOG',
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);
