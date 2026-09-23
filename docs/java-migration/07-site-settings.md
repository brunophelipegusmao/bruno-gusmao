# Site Settings — Spec

**Status:** ✅ Concluído
**Depende de:** Arquitetura
**Fonte no Nest:** `apps/api/src/site-settings/site-settings.controller.ts`, `apps/api/src/site-settings/site-settings.service.ts`, `apps/api/src/db/schema/site-settings.ts`

Padrão singleton — **não** virar CRUD genérico com múltiplas linhas.

## Modelo de dados

`SiteSettings` (tabela `site_settings`):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` | PK, gerado |
| `eventPopupEnabled` | `boolean` | `nullable=false, default=false` |
| `eventName` | `String` | `nullable=false, length=100, default='Evento'` |
| `eventDescription` | `String` | nullable, `length=500` |
| `eventImageUrl` | `String` | nullable, `length=2048`, URL |
| `eventBgColor` | `String` | `nullable=false, length=50, default='#1e293b'` |
| `eventTextColor` | `String` | `nullable=false, length=50, default='#e2e8f0'` |
| `updatedAt` | `Instant` | `@LastModifiedDate` (só updatedAt, sem createdAt no schema original — não usar `AuditableEntity` nem `CreatedAtOnlyEntity` aqui; anotar `updatedAt` diretamente na entity) |

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/api/site-settings` | público | Retorna a linha singleton (cria com defaults se ainda não existir) |
| PATCH | `/api/site-settings` | autenticado | Atualiza a linha singleton — **sem `{id}` na URL** |

## Regras de negócio

- `getOrCreate()`: busca a primeira (e única) linha da tabela; se não existir, cria uma com os defaults e retorna. Chamado tanto pelo `GET` quanto internamente pelo `PATCH` (que primeiro garante que a linha existe, depois atualiza).
- Resposta whitelist: nunca expor o `id` da linha no JSON de resposta — replicar o shape atual do Nest, que devolve só os campos de conteúdo (`eventPopupEnabled`, `eventName`, etc.), sem `id`.

## Notas de paridade com o Nest

- **Não** adicionar validação de "só pode existir uma linha" via constraint de banco — o Nest não tem isso, confia no padrão lazy-singleton da aplicação. Replicar o mesmo nível de proteção (nenhum a nível de schema).
- `PATCH` sem `{id}` na URL é intencional — é diferente de todos os outros módulos de recurso.

## Checklist de implementação

- [x] `SiteSettings` entity + `SiteSettingsRepository`
- [x] Flyway `V7__create_site_settings.sql`
- [x] DTOs: `SiteSettingsUpdateRequest` (todos os campos opcionais), `SiteSettingsResponse` (sem `id`)
- [x] `SiteSettingsService` (`getOrCreate`, `update`)
- [x] `SiteSettingsController` (`@RequestMapping("/api/site-settings")`, sem path variable)
- [x] Testes de integração escritos (`SiteSettingsControllerIT`): primeiro GET cria a linha com defaults; GETs subsequentes reusam a mesma linha; PATCH sem auth → 401; PATCH com auth atualiza e persiste

### Nota de execução

- `./mvnw -q compile` passa limpo.
- `./mvnw test` (compilação de teste) **não roda no momento** — bloqueado por uma lacuna de dependência no `pom.xml` que afeta todo o projeto, não só este módulo: no Spring Boot 4, `@AutoConfigureMockMvc`/MockMvc saiu de `spring-boot-test-autoconfigure` e foi para o artefato novo `org.springframework.boot:spring-boot-webmvc-test` (escopo `test`), que ainda não está declarado no `pom.xml`. O mesmo erro de compilação já aparece em `BadgeControllerIT` e `KanbanTaskControllerIT` (de outros módulos feitos em paralelo), então não é algo introduzido por este módulo — só não posso corrigir aqui porque a instrução deste módulo proíbe editar `pom.xml`. `SiteSettingsControllerIT` está escrito e cobre exatamente os 4 cenários pedidos; assim que a dependência for adicionada ao `pom.xml` (por quem tiver mandato para isso), o teste deve rodar sem alterações.
- Merge parcial do PATCH: como `SiteSettingsUpdateRequest` é um record simples, um campo ausente no corpo e um campo explicitamente `null` não são distinguíveis — ambos são tratados como "não alterar". O Nest, via Zod `.nullable()`, permite limpar `eventDescription`/`eventImageUrl` enviando `null` explícito; essa possibilidade não foi replicada (nenhuma tela do painel depende disso hoje). Documentado também no Javadoc do DTO.
