# Projects — Spec

**Status:** ✅ Concluído
**Depende de:** Badges
**Fonte no Nest:** `apps/api/src/projects/projects.controller.ts`, `apps/api/src/projects/projects.service.ts`, `apps/api/src/db/schema/projects.ts`

## Modelo de dados

`Project` (tabela `projects`, estende `AuditableEntity`):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` | PK, gerado |
| `name` | `String` | `nullable=false, unique=true, length=255` |
| `slug` | `String` | `nullable=false, unique=true, length=255`, regex `^[a-z0-9-]+$` na validação |
| `summary` | `String` | `nullable=false, length=300` |
| `image` | `String` | nullable, `length=2048`, URL |
| `projectUrl` | `String` | nullable, `length=2048`, URL |
| `repoUrl` | `String` | nullable, `length=2048`, URL |
| `badge1`, `badge2`, `badge3` | `@ManyToOne(optional=true)` → `Badge` | nullable, `onDelete=SET NULL` |
| `visible` | `boolean` | `nullable=false, default=true` |
| `featured` | `boolean` | `nullable=false, default=false` |
| `kanbanStatus` | `enum KanbanStatus {BACKLOG, TODO, IN_PROGRESS, DONE}` | `nullable=false, default=BACKLOG` |
| `createdAt`/`updatedAt` | `Instant` | via `AuditableEntity` |

`KanbanStatus` é um enum **compartilhado** com Post e KanbanTask — definir uma única vez (sugestão: `dev.brunogusmao.api.common.KanbanStatus`) em vez de duplicar por módulo.

DTOs: `ProjectCreateRequest`/`ProjectUpdateRequest` (com `badge1Id`/`badge2Id`/`badge3Id` como `UUID` opcionais em vez de referência direta à entity) e `ProjectResponse` (badges expandidos como `BadgeResponse` ou só os ids — replicar o shape atual do Nest, que devolve os ids, não os objetos).

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/api/projects` | público | Só `visible=true`, ordenado por `featured DESC, createdAt` |
| GET | `/api/projects/all` | autenticado | Todos os projetos, mesma ordenação |
| POST | `/api/projects` | autenticado | Cria |
| PATCH | `/api/projects/{id}` | autenticado | Atualiza parcialmente; 404 se não existir |
| DELETE | `/api/projects/{id}` | autenticado | Remove; 404 se não existir |

## Regras de negócio

- Único filtro de negócio: `findAllPublic()` só retorna `visible=true`; `findAll()` (rota `/all`) retorna tudo. Replicar exatamente essa distinção — é o mesmo padrão de Posts.
- Ordenação: `featured DESC, createdAt ASC` (destaque primeiro) em ambas as listagens.

## Notas de paridade com o Nest

- Badge1/2/3 são três slots opcionais separados, **não** uma tabela de junção — replicar como três `@ManyToOne` distintos, não um `@ManyToMany`.
- `ON DELETE SET NULL`: ao apagar um `Badge` referenciado, o projeto não deve ser bloqueado nem apagado em cascata — a FK deve virar `null`.

## Checklist de implementação

- [x] `KanbanStatus` enum compartilhado (já existia, criado pelo módulo Kanban Tasks — reusado)
- [x] `Project` entity + `ProjectRepository`
- [x] Flyway `V3__create_projects.sql` (FK → badges, `ON DELETE SET NULL` nos 3 badge ids)
- [x] DTOs + Bean Validation (slug regex, URLs, tamanhos)
- [x] `ProjectService` (findAllPublic, findAll, create, update parcial, remove)
- [x] `ProjectController` (`@RequestMapping("/api/projects")`)
- [x] Testes de integração: público só mostra `visible=true`; `/all` exige auth e mostra tudo; ordenação por featured

## Nota de implementação — bug pré-existente de `ObjectMapper` nos testes de integração

Ao escrever `ProjectControllerIT`, `@Autowired private ObjectMapper objectMapper` com
`import com.fasterxml.jackson.databind.ObjectMapper` (o padrão usado em
`BadgeControllerIT`/`KanbanTaskControllerIT`/`PostControllerIT`/`SiteSettingsControllerIT`/
`TodoControllerIT`) falha em runtime com `NoSuchBeanDefinitionException`, mesmo compilando
sem erro. Causa: `spring-boot-starter-parent:4.1.1` traz `spring-boot-starter-jackson`, que
usa **Jackson 3** (`tools.jackson.core:jackson-databind`) como implementação padrão do
`JacksonAutoConfiguration` — o bean autoconfigurado é `tools.jackson.databind.ObjectMapper`,
não `com.fasterxml.jackson.databind.ObjectMapper` (Jackson 2, presente no classpath só
transitivamente via springdoc/swagger-core, sem bean Spring correspondente). Rodar a suíte
inteira (`./mvnw -q test`) neste checkout confirma que os 5 testes de integração acima (30
dos 35 testes existentes antes deste módulo) falham por esse motivo — não é algo introduzido
por este módulo. `ProjectControllerIT` foi escrito já usando
`import tools.jackson.databind.ObjectMapper` (a API é equivalente:
`writeValueAsString`/`readValue`, mas `tools.jackson.core.JacksonException` é unchecked, ao
contrário de `com.fasterxml.jackson.core.JsonProcessingException`) e passa de verdade. Os
outros 5 arquivos de teste não foram alterados por estarem fora do escopo deste módulo.
