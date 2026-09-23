# Posts — Spec

**Status:** ✅ Concluído
**Depende de:** Badges
**Fonte no Nest:** `apps/api/src/posts/posts.controller.ts`, `apps/api/src/posts/posts.service.ts`, `apps/api/src/db/schema/posts.ts`

Estruturalmente idêntico a Projects, trocando `image`/`projectUrl`/`repoUrl` por `imageUrl`/`content`, e com uma rota pública a mais (busca por slug).

## Modelo de dados

`Post` (tabela `posts`, estende `AuditableEntity`):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` | PK, gerado |
| `name` | `String` | `nullable=false, unique=true, length=255` |
| `slug` | `String` | `nullable=false, unique=true, length=255`, regex `^[a-z0-9-]+$` |
| `summary` | `String` | `nullable=false, length=300` |
| `imageUrl` | `String` | nullable, `length=2048`, URL |
| `content` | `String` (`@Lob`/`columnDefinition="text"`) | `nullable=false` |
| `badge1`, `badge2`, `badge3` | `@ManyToOne(optional=true)` → `Badge` | nullable, `onDelete=SET NULL` |
| `visible` | `boolean` | `default=true` |
| `featured` | `boolean` | `default=false` |
| `kanbanStatus` | `KanbanStatus` (enum compartilhado, ver 03-projects.md) | `default=BACKLOG` |
| `createdAt`/`updatedAt` | `Instant` | via `AuditableEntity` |

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/api/posts` | público | Só `visible=true`, ordenado por `featured DESC, createdAt` |
| GET | `/api/posts/all` | autenticado | Todos os posts |
| GET | `/api/posts/{slug}` | público | Busca por slug; 404 se não achar |
| POST | `/api/posts` | autenticado | Cria |
| PATCH | `/api/posts/{id}` | autenticado | Atualiza parcialmente (por `id`, não `slug`); 404 se não existir |
| DELETE | `/api/posts/{id}` | autenticado | Remove; 404 se não existir |

## Regras de negócio

- Mesma distinção público/admin de Projects (`visible=true` vs. tudo).
- Busca por slug é uma rota própria, separada do `id` — usada pelo blog público. `PATCH`/`DELETE` continuam por `id`.

## Notas de paridade com o Nest

- **Atenção de ordering em `SecurityConfig`**: `GET /api/posts/all` precisa estar marcado `authenticated()` **antes** de `GET /api/posts/{slug}` na cadeia de regras — `"all"` também casa com o padrão de um segmento de `{slug}`. Isso já está resolvido na matriz de [00-arquitetura.md](00-arquitetura.md); este módulo só precisa saber que a rota `/all` funciona corretamente sem precisar tocar em `SecurityConfig`.
- Mesmas notas de badges de Projects (três slots `@ManyToOne`, `ON DELETE SET NULL`).

## Checklist de implementação

- [x] `Post` entity + `PostRepository`
- [x] Flyway `V4__create_posts.sql`
- [x] DTOs + Bean Validation
- [x] `PostService` (findAllPublic, findAll, findBySlug, create, update parcial por id, remove)
- [x] `PostController` (`@RequestMapping("/api/posts")`)
- [x] Testes de integração: público só `visible=true`; `/all` exige auth; `GET /{slug}` público e 404 se não achar; `/all` não é interpretado como slug

## Notas de implementação

- Todos os testes (`PostControllerIT`, 9 casos) rodam com Testcontainers Postgres real e passam (`./mvnw -q test -Dtest=PostControllerIT`, 0 falhas/erros).
- **Armadilha encontrada e documentada no teste**: no Spring Boot 4.1.1, o bean de `ObjectMapper` autoconfigurado (`spring-boot-starter-jackson`) é do novo Jackson 3 (`tools.jackson.databind.ObjectMapper`), não `com.fasterxml.jackson.databind.ObjectMapper` (Jackson 2 clássico, presente no classpath só transitivamente via `spring-boot-starter-webmvc-test`, sem virar bean). Autowirar o tipo clássico falha com `NoSuchBeanDefinitionException` — mesmo problema já presente em `BadgeControllerIT`/`KanbanTaskControllerIT` (não corrigido aqui, fora do escopo deste módulo). `PostControllerIT` contorna isso sem `@Autowired ObjectMapper`: corpos de requisição são JSON literal (text block) e respostas são verificadas via `jsonPath(...)`.
- `PostCreateRequest`/`PostUpdateRequest` usam `@URL` de `org.hibernate.validator.constraints` (já transitivo via `spring-boot-starter-validation`) para validar `imageUrl`, equivalente ao `z.string().url()` do Zod.
- `badge1Id`/`badge2Id`/`badge3Id` no create/update são resolvidos via `BadgeRepository.findById`, lançando `NotFoundException` (404) se o UUID não corresponder a um badge existente — não há checagem equivalente explícita no Nest (o FK falharia no banco), mas 404 é mais consistente com o padrão de erros da API Java.
