-- Módulo todos — modelo de dois usuários (ver docs/java-migration/06-todos.md).
-- shared=false (padrão): só o owner pode ler/editar/apagar. shared=true: qualquer
-- usuário autenticado pode ler/editar/apagar. FK -> users com ON DELETE CASCADE: se o
-- dono for removido, seus todos somem junto (equivalente ao onDelete: 'cascade' do
-- Drizzle em apps/api/src/db/schema/todos.ts).
--
-- created_at/updated_at usam TIMESTAMPTZ porque o Hibernate 6+ mapeia java.time.Instant
-- para "timestamp with time zone" por padrão (ver AuditableEntity).
CREATE TABLE todos (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    done BOOLEAN NOT NULL DEFAULT false,
    shared BOOLEAN NOT NULL DEFAULT false,
    owner_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_todos_owner_id ON todos (owner_id);
