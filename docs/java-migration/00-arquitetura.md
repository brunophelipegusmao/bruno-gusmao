# Arquitetura — Spec

**Status:** ✅ Pronta (scaffold já criado em `apps/api-java`)
**Depende de:** —
**Fonte no Nest:** `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/src/db/db.module.ts`

## Stack (versões verificadas em set/2026)

| Camada | Escolha | Versão | Motivo |
|---|---|---|---|
| Build | Maven (via `./mvnw`, wrapper já commitado) | 3.9.16 | Já é o que o usuário está estudando |
| Runtime | Java 21 (LTS) | JDK 21 | Piso real da stack: Flyway 13.x e springdoc-openapi 3.0.3 exigem 21+, mesmo o Boot 4.1 pedindo só 17 |
| Framework | Spring Boot | 4.1.1 (Spring Framework 7.0.x) | Major atual; Jakarta EE 11 (`jakarta.*`, não `javax.*`) |
| Web | `spring-boot-starter-web` | — | Servlet/Tomcat embarcado, sem WebFlux |
| ORM | `spring-boot-starter-data-jpa` | — | Hibernate via Jakarta Persistence 3.2 |
| Driver DB | `org.postgresql:postgresql` | 42.7.12 | Gerenciado pelo BOM do Boot |
| Migrations | `flyway-core` + `flyway-database-postgresql` | 13.7.0 | Desde a 10.x o suporte a Postgres é artefato separado |
| Auth | `spring-boot-starter-oauth2-client` + `spring-boot-starter-oauth2-resource-server` | — | Login Google + validação do JWT próprio (Nimbus vem transitivo via `spring-security-oauth2-jose`, sem lib extra) |
| Validação | `spring-boot-starter-validation` (Jakarta Bean Validation 3.1) | — | Substitui os schemas Zod |
| WebSocket | `spring-boot-starter-websocket` (Jakarta WebSocket 2.2, sem STOMP) | — | Mensagens já são JSON simples `{event, data}` |
| Docs | `springdoc-openapi-starter-webmvc-ui` | 3.0.3 | Lockstep com major do Boot (3.x ↔ Boot 4.x) |
| Testes | JUnit 5 + `spring-boot-starter-test` + Testcontainers Postgres + **`maven-failsafe-plugin`** | — | Evita mocks de banco. **Importante**: todos os testes de integração são `*ControllerIT.java` (convenção do Failsafe) — rodar `./mvnw verify`, **não** `./mvnw test` (Surefire sozinho ignora classes `*IT.java` silenciosamente, sem erro nenhum — bug real descoberto nesta migração, custou tempo de depuração) |

`pom.xml` herda de `spring-boot-starter-parent:4.1.1` — a maioria das versões (Security, Validation, WebSocket, driver Postgres) vem do BOM automaticamente; só Flyway e springdoc têm override explícito porque o BOM às vezes atrasa um pouco.

## Estrutura de pacotes (já scaffoldada)

```
apps/api-java/
├── mvnw, mvnw.cmd, .mvn/wrapper/maven-wrapper.properties
├── pom.xml
├── src/main/java/dev/brunogusmao/api/
│   ├── ApiApplication.java
│   ├── config/
│   │   ├── CorsConfig.java         ✅ pronto
│   │   ├── JpaAuditingConfig.java  ✅ pronto
│   │   ├── OpenApiConfig.java      ✅ pronto
│   │   ├── SecurityConfig.java     ⬜ módulo Auth
│   │   └── WebSocketConfig.java    ⬜ módulo WebSocket
│   ├── common/
│   │   ├── AuditableEntity.java       ✅ pronto (createdAt+updatedAt)
│   │   ├── CreatedAtOnlyEntity.java   ✅ pronto (só createdAt — usar em Badge)
│   │   └── exception/
│   │       ├── ApiExceptionHandler.java     ✅ pronto
│   │       ├── NotFoundException.java       ✅ pronto
│   │       ├── ForbiddenException.java      ✅ pronto
│   │       └── ValidationErrorResponse.java ✅ pronto
│   ├── auth/          — cada módulo abaixo é um pacote de feature: entity, repository, service, controller, dto/
│   ├── badges/
│   ├── projects/
│   ├── posts/
│   ├── kanbantasks/
│   ├── todos/
│   ├── sitesettings/
│   └── kanban/         — WebSocket handler agregador (kanban) + handler de todos
├── src/main/resources/
│   ├── application.yml, application-dev.yml, application-prod.yml   ✅ prontos
│   └── db/migration/   — Flyway V*.sql, um grupo por módulo
└── src/test/java/...
```

Cada módulo de recurso segue: `Entity` (JPA), `Repository` (Spring Data JPA), `Service`, `Controller`, `dto/{X}Request.java` + `dto/{X}Response.java` (records). Mapeamento Entity↔DTO é manual (métodos `toResponse()`), sem MapStruct na v1.

## Convenções cross-cutting (obrigatórias pra todos os módulos)

1. **Sem `server.servlet.context-path`.** Cada `@RestController` usa `@RequestMapping("/api/...")` explícito no próprio controller. Motivo: `context-path` também prefixaria os endpoints WebSocket, quebrando o requisito "WS sem `/api`" (equivalente ao `app.setGlobalPrefix('api')` do Nest, que só afeta HTTP).
2. **CORS** já configurado em `CorsConfig.java` — métodos `GET/POST/PUT/PATCH/DELETE/OPTIONS`, `allowCredentials=true`, origem = `app.web-url`. Nenhum módulo precisa mexer nisso.
3. **Erros padronizados** via `ApiExceptionHandler` (`@RestControllerAdvice`, já pronto): `MethodArgumentNotValidException` → 400 (`ValidationErrorResponse`, formato equivalente ao `.flatten()` do Zod); `NotFoundException` própria → 404; `ForbiddenException` própria → 403; `AccessDeniedException`/`AuthenticationException` do Spring Security → 403/401. Services de módulo devem lançar `NotFoundException`/`ForbiddenException` de `dev.brunogusmao.api.common.exception`, nunca `ResponseStatusException` solto.
4. **`createdAt`/`updatedAt` automáticos**: entities estendem `AuditableEntity` (createdAt+updatedAt) ou `CreatedAtOnlyEntity` (só createdAt — hoje só `Badge` usa esta). Nenhum service deve setar essas datas manualmente.
5. **Sem paginação** em nenhum `findAll` — replicar exatamente esse comportamento, não inventar paginação que a API atual não tem.
6. **`@RestControllerAdvice` já cobre 401/403/404/400** — controllers de módulo não devem ter try/catch nem `@ExceptionHandler` próprios.

## Matriz de autorização (dona: módulo Auth — `SecurityConfig.java`)

Esta matriz é **centralizada** e implementada uma única vez pelo módulo Auth. Módulos de recurso **não editam `SecurityConfig.java`** — só implementam seus controllers normalmente; a autorização já cobre as rotas deles.

Ordem importa (Spring Security usa "primeiro match vence" dentro de `authorizeHttpRequests`) — regras mais específicas antes de wildcards que poderiam capturá-las:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/docs/**", "/api-docs/**", "/swagger-ui/**").permitAll()
    .requestMatchers("/oauth2/**", "/login/**").permitAll()
    .requestMatchers("/ws/**").permitAll()               // auth do handshake é feita dentro do handler, não aqui

    .requestMatchers(HttpMethod.GET, "/api/badges").permitAll()

    .requestMatchers(HttpMethod.GET, "/api/projects/all").authenticated()  // antes do permitAll de baixo, path literal não colide
    .requestMatchers(HttpMethod.GET, "/api/projects").permitAll()

    .requestMatchers(HttpMethod.GET, "/api/posts/all").authenticated()     // TEM que vir antes de /api/posts/{slug}:
    .requestMatchers(HttpMethod.GET, "/api/posts").permitAll()             // "all" também bate no padrão {slug} de 1 segmento
    .requestMatchers(HttpMethod.GET, "/api/posts/{slug}").permitAll()

    .requestMatchers(HttpMethod.GET, "/api/kanban-tasks").permitAll()
    .requestMatchers(HttpMethod.GET, "/api/site-settings").permitAll()

    .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
    .requestMatchers(HttpMethod.POST, "/api/auth/logout").authenticated()

    .requestMatchers("/api/todos/**").authenticated()     // inclui GET — resposta é escopada por usuário

    .requestMatchers("/api/**").authenticated()           // catch-all: cobre todo POST/PATCH/DELETE de todos os módulos
    .anyRequest().permitAll()
)
```

**CSRF**: desabilitado (`.csrf(csrf -> csrf.disable())`). Mitigação equivalente ao que o BetterAuth já faz hoje: cookie `SameSite=Lax` (bloqueia POST cross-site) + CORS restrito à origem exata do frontend. Documentar essa decisão no código, não deixar implícita.

**Sessão**: `SessionCreationPolicy.STATELESS` — não há `HttpSession` do lado do servidor, o JWT é a única fonte de verdade.

## Variáveis de ambiente (`apps/api-java`)

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/bruno_gusmao_java
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ALLOWED_EMAILS=email1@gmail.com,email2@gmail.com
JWT_SECRET=<mínimo 32 bytes aleatórios>
JWT_EXPIRATION_DAYS=7
JWT_COOKIE_NAME=access_token
WEB_URL=http://localhost:3000
PORT=3002
SPRING_PROFILES_ACTIVE=dev
```

Banco **separado** do Postgres de produção do Nest — `bruno_gusmao_java` (ou nome equivalente), zero risco pros dados reais.

## Checklist do scaffold

- [x] `pom.xml` com todas as dependências e versões
- [x] `./mvnw` / `.mvn/wrapper/maven-wrapper.properties`
- [x] `ApiApplication.java`
- [x] `application.yml` + `application-dev.yml` + `application-prod.yml`
- [x] `common/` (exceptions + entidades auditáveis)
- [x] `CorsConfig`, `OpenApiConfig`, `JpaAuditingConfig`
- [x] `maven-failsafe-plugin` (roda os `*ControllerIT.java` via `./mvnw verify`)
- [x] `SecurityConfig` (módulo Auth)
- [x] `WebSocketConfig` (módulo WebSocket)
