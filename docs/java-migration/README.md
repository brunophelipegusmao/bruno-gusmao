# Migração Java — Índice

`apps/api-java` é uma reimplementação em Spring Boot 4.1 (Java 21) da API do portfólio (hoje NestJS + Fastify + Drizzle em `apps/api`), feita como **projeto de aprendizado** — não por necessidade técnica. `apps/api` continua sendo o backend de produção.

Plano completo (contexto, decisões de arquitetura, roteiro): `/home/bruno/.claude/plans/n-o-agora-preciso-que-adaptive-cook.md`.

## Status dos módulos

| Módulo | Spec | Status | Depende de |
|---|---|---|---|
| Arquitetura | [00-arquitetura.md](00-arquitetura.md) | ✅ Pronta | — |
| Auth | [01-auth.md](01-auth.md) | ✅ Concluído (testado) | Arquitetura |
| Badges | [02-badges.md](02-badges.md) | ✅ Concluído (testado) | Arquitetura |
| Projects | [03-projects.md](03-projects.md) | ✅ Concluído (testado) | Badges |
| Posts | [04-posts.md](04-posts.md) | ✅ Concluído (testado) | Badges |
| Kanban Tasks | [05-kanban-tasks.md](05-kanban-tasks.md) | ✅ Concluído (testado) | Arquitetura |
| Todos | [06-todos.md](06-todos.md) | ✅ Concluído (testado) | Auth |
| Site Settings | [07-site-settings.md](07-site-settings.md) | ✅ Concluído (testado) | Arquitetura |
| Kanban WebSocket | [08-kanban-websocket.md](08-kanban-websocket.md) | ✅ Concluído (Kanban testado; `/ws/todos` verificado por leitura + build, sem IT dedicado) | Projects, Posts, Kanban Tasks, Todos, Auth |
| Database/Flyway | [09-database-flyway.md](09-database-flyway.md) | ✅ V1–V7 aplicadas e validadas | Todos os módulos acima |

**Migração completa** — todos os 9 specs implementados e verificados. **"Testado" significa**: `./mvnw verify` (não `./mvnw test`!) roda de verdade contra Postgres real via Testcontainers. **Achado importante desta sessão**: todos os testes de integração seguem a convenção `*ControllerIT.java`/`*IT.java`, que é o padrão do plugin **Failsafe**, não do Surefire — `./mvnw test` sozinho só executa classes terminadas em `Test` (ou seja, só `AuthIntegrationTest`) e ignora silenciosamente todos os outros módulos. O `pom.xml` já tem `maven-failsafe-plugin` configurado; **sempre use `./mvnw verify` para rodar a suíte completa**. Confirmado com uma rodada limpa do zero: **BUILD SUCCESS, 47/47 testes passando** (42 via Failsafe nos 8 módulos `*IT.java` + 5 via Surefire em `AuthIntegrationTest`).

Atualize a coluna Status (⬜ Não iniciado / 🔶 Em andamento / ✅ Concluído) conforme cada módulo for implementado em `apps/api-java`.

## Como usar estes specs

Cada arquivo `NN-modulo.md` segue sempre a mesma estrutura: Status, Depende de, Fonte no Nest, Modelo de dados, Endpoints, Regras de negócio, Notas de paridade, Checklist de implementação. Isso é intencional — qualquer um pode abrir um spec sem contexto prévio e saber exatamente o que implementar e onde encontrar a referência original em `apps/api/src/`.

**Convenção que atravessa todos os módulos**: a matriz de autorização (o que é público vs. autenticado) já está centralizada em `SecurityConfig` (módulo Auth, ver [00-arquitetura.md](00-arquitetura.md)). Módulos de recurso (Badges, Projects, Posts, Kanban Tasks, Todos, Site Settings) **não** devem editar `SecurityConfig` — a autorização das rotas deles já está pré-definida lá.

## Ordem de leitura/implementação recomendada

1. [00-arquitetura.md](00-arquitetura.md) — stack, pacotes, convenções
2. [01-auth.md](01-auth.md) — bloqueante para Todos e para o WebSocket de Todos
3. [02-badges.md](02-badges.md) — fixa o padrão Controller/Service/Repository/DTO
4. [03-projects.md](03-projects.md) e [04-posts.md](04-posts.md) — dependem de Badges
5. [05-kanban-tasks.md](05-kanban-tasks.md) — independente, sem FKs
6. [06-todos.md](06-todos.md) — depende de Auth (User + CurrentUser)
7. [07-site-settings.md](07-site-settings.md) — independente, padrão singleton
8. [08-kanban-websocket.md](08-kanban-websocket.md) — depende de todos os módulos de recurso + Auth
9. [09-database-flyway.md](09-database-flyway.md) — consolida as migrations de todos os módulos acima
