# Database / Flyway — Spec

**Status:** ⬜ Não iniciado
**Depende de:** Todos os módulos acima
**Fonte no Nest:** `apps/api/src/db/schema/*.ts`, `pnpm --filter api db:generate` / `db:migrate` (drizzle-kit)

Consolida as migrations que cada módulo cria individualmente — uma migration por "grupo lógico", na ordem de dependência de FKs. Cada módulo já lista seu próprio arquivo Flyway no checklist do spec correspondente; este documento é o índice + o contrato de paridade de schema.

## Migrations (ordem obrigatória — FKs dependem da ordem)

| Arquivo | Módulo | Cria |
|---|---|---|
| `V1__create_users.sql` | [01-auth.md](01-auth.md) | `users` |
| `V2__create_badges.sql` | [02-badges.md](02-badges.md) | `badges` |
| `V3__create_projects.sql` | [03-projects.md](03-projects.md) | `projects` (FK → `badges`, `ON DELETE SET NULL` ×3) |
| `V4__create_posts.sql` | [04-posts.md](04-posts.md) | `posts` (idem) |
| `V5__create_kanban_tasks.sql` | [05-kanban-tasks.md](05-kanban-tasks.md) | `kanban_tasks` |
| `V6__create_todos.sql` | [06-todos.md](06-todos.md) | `todos` (FK → `users`, `ON DELETE CASCADE`) |
| `V7__create_site_settings.sql` | [07-site-settings.md](07-site-settings.md) | `site_settings` |

Local: `apps/api-java/src/main/resources/db/migration/`.

## Contrato de paridade de schema

Cada `CREATE TABLE` deve espelhar **exatamente** as tabelas do Drizzle já documentadas nos specs de módulo (tamanhos de `varchar`, `NOT NULL`, `DEFAULT`, `UNIQUE`) — isso é o que garante que os dois backends (Nest e Java) produzem o mesmo contrato de dados, mesmo rodando em bancos separados. Qualquer divergência de tipo/constraint deve ser justificada explicitamente no spec do módulo correspondente (nenhuma foi identificada até agora — os schemas devem bater 1:1).

## Convenções

- `hibernate.ddl-auto: validate` em todos os profiles (`application.yml`) — o schema é **sempre** dono do Flyway, nunca gerado pelo Hibernate. Isso já está configurado no scaffold.
- Nomes de coluna em `snake_case` no banco (`created_at`, `owner_id`, etc.), mapeados para `camelCase` nas entities via `@Column(name = "...")` — Hibernate não infere `snake_case` automaticamente sem a `PhysicalNamingStrategy` padrão do Spring Boot já fazer isso; ainda assim, ser explícito no `@Column` evita surpresas.
- `gen_random_uuid()` (extensão `pgcrypto`, ou `uuid-ossp` conforme disponível no Postgres do ambiente) para os defaults de `id` no banco, espelhando o `defaultRandom()` do Drizzle — ou gerar o UUID do lado da aplicação via `@GeneratedValue(strategy = GenerationType.UUID)` do Hibernate (mais simples, não depende de extensão do Postgres). Preferir a segunda opção salvo necessidade específica.

## Checklist de implementação

- [ ] Confirmar que os 7 arquivos Flyway acima existem e rodam em ordem sem erro (`./mvnw flyway:migrate` ou o próprio boot da aplicação com `spring.flyway.enabled=true`)
- [ ] Rodar `./mvnw spring-boot:run` contra o banco `bruno_gusmao_java` local e confirmar que o schema criado bate campo a campo com os specs de módulo
- [ ] Atualizar a tabela de status em [README.md](README.md) conforme cada migration for validada
