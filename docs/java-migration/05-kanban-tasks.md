# Kanban Tasks — Spec

**Status:** ✅ Concluído
**Depende de:** Arquitetura
**Fonte no Nest:** `apps/api/src/kanban-tasks/kanban-tasks.controller.ts`, `apps/api/src/kanban-tasks/kanban-tasks.service.ts`, `apps/api/src/db/schema/kanban-tasks.ts`

Módulo independente, sem FKs — rápido de implementar.

## Modelo de dados

`KanbanTask` (tabela `kanban_tasks`, estende `AuditableEntity`):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` | PK, gerado |
| `title` | `String` | `nullable=false, length=255` |
| `description` | `String` | nullable, `length=1000` |
| `taskType` | `enum TaskType {BLOG, PROJECT, CUSTOM}` | `nullable=false, default=BLOG` |
| `color` | `String` | nullable, `length=50` — só usado quando `taskType=CUSTOM` |
| `kanbanStatus` | `KanbanStatus` (enum compartilhado, ver 03-projects.md) | `default=BACKLOG` |
| `createdAt`/`updatedAt` | `Instant` | via `AuditableEntity` |

Sem FK pra `badges`/`projects` apesar do `taskType` sugerir associação — é só metadado visual. **Não "consertar" isso** adicionando uma FK que não existe no Nest.

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/api/kanban-tasks` | público | Lista tudo, sem distinção admin — dado não sensível |
| POST | `/api/kanban-tasks` | autenticado | Cria |
| PATCH | `/api/kanban-tasks/{id}` | autenticado | Atualiza parcialmente; 404 se não existir |
| DELETE | `/api/kanban-tasks/{id}` | autenticado | Remove; 404 se não existir |

## Regras de negócio

Nenhuma além de CRUD — ordenação por `createdAt` ascendente (diferente de Projects/Posts, que ordenam por `featured DESC`).

## Notas de paridade com o Nest

- Diferente de Projects/Posts, **não há** rota `/all` — só existe uma listagem pública única (dado não sensível, confirmado no Nest).

## Checklist de implementação

- [x] `TaskType` enum
- [x] `KanbanTask` entity + `KanbanTaskRepository`
- [x] Flyway `V5__create_kanban_tasks.sql`
- [x] DTOs + Bean Validation
- [x] `KanbanTaskService` (findAll ordenado por createdAt, create, update parcial, remove)
- [x] `KanbanTaskController` (`@RequestMapping("/api/kanban-tasks")`)
- [x] Testes de integração escritos (`KanbanTaskControllerIT`, Testcontainers Postgres): GET público; POST/PATCH/DELETE exigem auth; 404 em update/remove de id inexistente. **Não foi possível rodá-los neste ambiente** — o Docker Engine local (29.8.0) rejeita a API version antiga (1.32) que o `docker-java` 3.4.2 (transitivo de `testcontainers:1.21.3`, fixado no `pom.xml`) usa por padrão, exigindo no mínimo 1.40. `DOCKER_API_VERSION=1.51` no ambiente não teve efeito. Não mexi no `pom.xml` para tentar contornar (fora do escopo deste módulo). Compilação do teste foi verificada isoladamente (cópia do projeto, ver relatório da tarefa).
- [x] `KanbanStatus` (`dev.brunogusmao.api.common`) — enum compartilhado, criado por este módulo para uso futuro em Projects/Posts
