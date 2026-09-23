# Badges — Spec

**Status:** ✅ Concluído
**Depende de:** Arquitetura
**Fonte no Nest:** `apps/api/src/badges/badges.controller.ts`, `apps/api/src/badges/badges.service.ts`, `apps/api/src/db/schema/badges.ts`

Módulo mais simples — fixa o padrão Controller/Service/Repository/DTO que os outros módulos de recurso vão seguir.

## Modelo de dados

`Badge` (tabela `badges`, estende `CreatedAtOnlyEntity` — **não** tem `updatedAt` no schema original):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` | PK, gerado |
| `name` | `String` | `nullable=false, unique=true, length=100` |
| `slug` | `String` | `nullable=false, unique=true, length=100` |
| `bgColor` | `String` | `nullable=false, length=50, default '#1e293b'` |
| `textColor` | `String` | `nullable=false, length=50, default '#e2e8f0'` |
| `createdAt` | `Instant` | via `CreatedAtOnlyEntity` |

DTOs (Bean Validation):
- `BadgeCreateRequest(String name, String slug, String bgColor, String textColor)` — `name`: `@NotBlank @Size(max=100)`; `slug`: `@NotBlank @Size(max=100) @Pattern(regexp="^[a-z0-9-]+$")`; `bgColor`/`textColor`: `@Size(max=50)`, opcionais (default aplicado no service se nulo).
- `BadgeUpdateRequest` — mesmos campos, todos opcionais (sem `@NotBlank` — merge parcial no service).
- `BadgeResponse(UUID id, String name, String slug, String bgColor, String textColor, Instant createdAt)`.

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/api/badges` | público | Lista todos, ordenado por `name` |
| POST | `/api/badges` | autenticado | Cria badge |
| PATCH | `/api/badges/{id}` | autenticado | Atualiza parcialmente; 404 se não existir |
| DELETE | `/api/badges/{id}` | autenticado | Remove; 404 se não existir |

## Regras de negócio

Nenhuma além de CRUD simples. Sem filtros, sem ownership, sem singleton — o módulo de referência mais direto.

## Notas de paridade com o Nest

- Replicar exatamente: unicidade de `name` e `slug`; defaults de cor; ordenação por `name`.
- `Badge` **não** estende `AuditableEntity` — só tem `createdAt`, usar `CreatedAtOnlyEntity` (ver 00-arquitetura.md).

## Checklist de implementação

- [x] `Badge` entity + `BadgeRepository`
- [x] Flyway `V2__create_badges.sql`
- [x] `BadgeCreateRequest`/`BadgeUpdateRequest`/`BadgeResponse` (DTOs)
- [x] `BadgeService` (findAll ordenado por name, create, update parcial, remove — 404 via `NotFoundException`)
- [x] `BadgeController` (`@RequestMapping("/api/badges")`)
- [x] Testes de integração escritos (`BadgeControllerIT`): GET público sem token; POST sem token → 401; PATCH/DELETE de id inexistente → 404. **Não executados** — ver nota abaixo.

### Nota sobre os testes de integração

`BadgeControllerIT` (Testcontainers Postgres) foi escrito e **compila** isoladamente contra
o classpath de teste real do projeto, mas não pôde ser executado via `./mvnw test`: no
momento da implementação, os módulos `kanbantasks` e `sitesettings` (feitos em paralelo
por outros agentes) já tinham testes usando `@AutoConfigureMockMvc`
(`org.springframework.boot.test.autoconfigure.web.servlet`), classe que no Spring Boot
4.1.1 foi extraída do `spring-boot-test-autoconfigure` para um módulo separado
(`spring-boot-webmvc-test` / starter `spring-boot-starter-webmvc-test`) **não declarado
no `pom.xml`** — isso quebra o `test-compile` do projeto inteiro, não só de badges.

Por isso `BadgeControllerIT` evita `@AutoConfigureMockMvc` de propósito: monta o `MockMvc`
manualmente a partir do `WebApplicationContext`
(`MockMvcBuilders.webAppContextSetup(...).apply(springSecurity())`), usando só
`spring-test` puro (já presente transitivamente via `spring-boot-starter-test`). Ainda
assim, como o `test-compile` do módulo inteiro falha por causa dos outros pacotes de
teste, não foi possível rodar `./mvnw test` de ponta a ponta para confirmar a execução
real (com Postgres via Testcontainers). Recomenda-se avaliar a adição de
`spring-boot-starter-webmvc-test` (escopo test) ao `pom.xml` — fora do escopo deste
módulo, já que a instrução era não editá-lo.
