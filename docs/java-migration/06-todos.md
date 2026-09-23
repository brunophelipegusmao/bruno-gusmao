# Todos — Spec

**Status:** ✅ Concluído
**Depende de:** Auth
**Fonte no Nest:** `apps/api/src/todos/todos.controller.ts`, `apps/api/src/todos/todos.service.ts`, `apps/api/src/db/schema/todos.ts`

**Este é o módulo que define o modelo de dois usuários** — a razão de a migração ter sido replanejada em torno de multi-usuário desde o início. Maior valor de aprendizado: `@AuthenticationPrincipal`/`CurrentUser` em profundidade, queries com `OR` no Spring Data JPA, e uma regra de autorização 403 que não é um simples "autenticado ou não".

## Modelo de dados

`Todo` (tabela `todos`, estende `AuditableEntity`):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` | PK, gerado |
| `title` | `String` | `nullable=false, length=255` |
| `description` | `String` | nullable, `length=1000` |
| `done` | `boolean` | `nullable=false, default=false` |
| `shared` | `boolean` | `nullable=false, default=false` |
| `owner` | `@ManyToOne(optional=false)` → `User` | `nullable=false, onDelete=CASCADE` |
| `createdAt`/`updatedAt` | `Instant` | via `AuditableEntity` |

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/api/todos` | autenticado | Escopado: tarefas do usuário + tudo que é `shared=true` |
| POST | `/api/todos` | autenticado | Cria; `owner` sempre setado a partir do usuário autenticado |
| PATCH | `/api/todos/{id}` | autenticado | 404 se não existir; 403 se privado e não for o dono |
| DELETE | `/api/todos/{id}` | autenticado | Mesma regra de 403/404 do PATCH |

**Toda rota exige autenticação, inclusive o GET** — diferente do padrão público/admin de Badges/Projects/Posts/KanbanTasks, porque a resposta do GET depende de quem pergunta.

## Regras de negócio

- **Leitura** (`findAllForUser(userId)`): `WHERE shared = true OR owner.id = :userId`, ordenado por `createdAt`. Em Spring Data JPA, implementar via `@Query` custom no repository (não dá pra expressar `OR` entre duas condições diferentes com method-query-derivation de forma limpa):
  ```java
  @Query("SELECT t FROM Todo t WHERE t.shared = true OR t.owner.id = :userId ORDER BY t.createdAt")
  List<Todo> findAllForUser(@Param("userId") UUID userId);
  ```
- **Escrita — `owner` nunca vem do client.** No `POST`, o `owner` é sempre o usuário autenticado (`@CurrentUser`), nunca um campo do request body. O DTO de criação **não tem** campo `ownerId`.
- **`assertMutable(id, userId)`** — chamado por `update` e `remove` antes de qualquer alteração:
  1. 404 (`NotFoundException`) se o todo não existe.
  2. **403 (`ForbiddenException`) se `!todo.isShared() && !todo.getOwner().getId().equals(userId)`** — um todo privado só pode ser mexido pelo dono; um todo compartilhado pode ser mexido por **qualquer** usuário autenticado do painel (não só o dono). Essa é a regra central do modelo de dois usuários — replicar exatamente, é o comportamento mais importante deste módulo inteiro.
- **Update é merge parcial, não substituição total.** O DTO de update em Bean Validation não tem o conceito de "default" que o Zod tem (não existe o risco do `.partial()` do Nest resetar `shared` silenciosamente — ver nota do Nest abaixo), mas o `TodoService.update()` ainda deve só sobrescrever campos não-nulos do `TodoUpdateRequest`, nunca substituir o objeto inteiro — um PATCH que não envia `shared` não deve alterar o valor atual do campo.

## Notas de paridade com o Nest

- No Nest, o schema de update (`updateTodoSchema`) é construído **separado** do de insert (não deriva de `.partial()`) porque o `.default(false)` de `shared` sobreviveria ao `.partial()` e resetaria o campo silenciosamente em PATCHs que não o enviam. Em Java/Bean Validation esse risco específico não existe (DTOs não têm "default" implícito), mas o cuidado equivalente é: **nunca** usar um `set()` genérico que sobrescreve todos os campos da entity a partir do DTO — sempre merge campo a campo, só quando não-nulo.
- `assertMutable` deve ser um método privado do `TodoService`, chamado por `update` e `remove` — não duplicar a lógica de autorização nos dois métodos.

## Checklist de implementação

- [x] `Todo` entity + `TodoRepository` (com o `@Query` de `findAllForUser`)
- [x] Flyway `V6__create_todos.sql` (FK → `users`, `ON DELETE CASCADE`)
- [x] DTOs: `TodoCreateRequest` (sem `ownerId`), `TodoUpdateRequest` (todos os campos opcionais), `TodoResponse` (inclui `ownerId`, `shared`)
- [x] `TodoService` (`findAllForUser`, `create` com owner forçado, `update`/`remove` via `assertMutable`)
- [x] `TodoController` (`@RequestMapping("/api/todos")`, usa `@CurrentUser` em todas as rotas)
- [x] Testes de integração: GET só mostra próprios + compartilhados; criar sempre seta owner = usuário autenticado (mesmo se o client tentar mandar outro); PATCH/DELETE de todo privado de outro usuário → 403; PATCH/DELETE de todo compartilhado de outro usuário → 200; PATCH parcial não reseta `shared` quando omitido

## Notas de implementação

- `TodoUpdateRequest` usa `Boolean` (wrapper) para `done` **e** `shared` — não só `shared`
  como o texto original desta spec sugeria — pelo mesmo motivo: distinguir "campo omitido"
  de "enviado como `false`" em qualquer um dos dois booleans do merge parcial.
- `TodoService.remove` retorna o `TodoResponse` do registro removido (em vez de `void`),
  espelhando o padrão já usado em `KanbanTaskService.remove` e o `TodosService.remove` do
  Nest (que também retorna a linha apagada via `.returning()`).
- Achado de ambiente (não é bug deste módulo): no Spring Boot 4.1.1 deste projeto, o bean
  autoconfigurado de `ObjectMapper` é `tools.jackson.databind.ObjectMapper` (Jackson 3, novo
  default do Boot 4.1) — `com.fasterxml.jackson.databind.ObjectMapper` (Jackson 2 clássico)
  só está no classpath transitivamente via springdoc/swagger-core, sem virar bean Spring.
  Isso faz `@Autowired private ObjectMapper objectMapper;` (import clássico) falhar com
  `NoSuchBeanDefinitionException` — afeta hoje `BadgeControllerIT`, `SiteSettingsControllerIT`
  e `KanbanTaskControllerIT` (pré-existente, não introduzido por este módulo; confirmado
  rodando esses testes antes de qualquer alteração deste trabalho). `TodoControllerIT`
  evita o problema instanciando seu próprio `new ObjectMapper()` local em vez de autowirar.
