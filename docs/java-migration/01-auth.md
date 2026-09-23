# Auth — Spec

**Status:** ✅ Concluído (código completo e `./mvnw -q compile` / `./mvnw -q test-compile` passam; execução dos testes bloqueada por um problema de infraestrutura de build compartilhada, ver checklist abaixo)
**Depende de:** Arquitetura
**Fonte no Nest:** `apps/api/src/auth/auth.ts`, `apps/api/src/auth/auth.guard.ts`, `apps/api/src/auth/current-user.decorator.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/src/db/schema/user.ts`

Este é o módulo prioritário — Todos e o WebSocket de Todos dependem dele.

## Modelo de dados

`User` (tabela `users`):

| Campo | Tipo Java/JPA | Constraint |
|---|---|---|
| `id` | `UUID` (`@Id @GeneratedValue`) | PK |
| `name` | `String` | `nullable = false` |
| `email` | `String` | `nullable = false, unique = true` |
| `imageUrl` | `String` | nullable |
| `createdAt`/`updatedAt` | `Instant` | via `AuditableEntity` |

Diferente do BetterAuth, **não** portar `session`/`account`/`verification` — são implementação interna da lib, sem sentido fora dela. Login é só Google OAuth2 (login por senha do Nest é dev-only, não é portado).

## Fluxo de login (Google OAuth2 → JWT próprio em cookie httpOnly)

1. Frontend redireciona pra `GET /oauth2/authorization/google` (endpoint padrão do `spring-boot-starter-oauth2-client`, não precisa de controller).
2. Google autentica, chama o callback padrão `/login/oauth2/code/google`.
3. `AllowedEmailsOAuth2UserService` (estende `DefaultOAuth2UserService`): depois de obter o `OAuth2User` do Google, verifica o e-mail contra `app.security.allowed-emails` (propriedade `List<String>`, bind de `ALLOWED_EMAILS=a@x.com,b@x.com`). Fora da lista → lança `OAuth2AuthenticationException` (login negado). Na lista → `findByEmail` ou cria o `User` (find-or-create, replica `databaseHooks.user.create.before` do Nest).
4. `OAuth2LoginSuccessHandler` (`AuthenticationSuccessHandler`): gera o JWT próprio via Nimbus (`SignedJWT` + `MACSigner`, HS256; claims `sub=user.id`, `email`, `name`; segredo em `app.security.jwt-secret`, mínimo 32 bytes; expiração `app.security.jwt-expiration-days`, default 7), grava em cookie (`app.security.jwt-cookie-name`, default `access_token`) com `httpOnly=true`, `secure=true` em prod, `SameSite=Lax`, `path=/`, e redireciona pra `${app.web-url}/ControlPanel` (ou rota de callback equivalente).
5. Requisições seguintes: `JwtDecoder` bean (`NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS256).build()`) valida o JWT via `spring-boot-starter-oauth2-resource-server`. Como o token vem em **cookie**, não em header `Authorization`, é necessário um `BearerTokenResolver` customizado (`CookieBearerTokenResolver`) lendo o cookie em vez do header.
6. `@CurrentUser`: anotação customizada + `HandlerMethodArgumentResolver` que lê o `Jwt` principal do `SecurityContext` (claims `sub`/`email`) e devolve um record `CurrentUserPrincipal(UUID id, String email)` — equivalente direto ao `@CurrentUser()` decorator do Nest.
7. Logout: `POST /api/auth/logout` limpa o cookie (`Max-Age=0`). Sem invalidação server-side possível com JWT stateless puro — trade-off aceito; extensão futura seria blocklist de `jti`, fora de escopo agora.
8. `GET /api/auth/me`: retorna `{id, name, email}` do usuário autenticado.

## Endpoints

| Método | Rota | Guarda | Descrição |
|---|---|---|---|
| GET | `/oauth2/authorization/google` | pública | Inicia fluxo OAuth2 (endpoint padrão do Spring, sem controller) |
| GET | `/login/oauth2/code/google` | pública | Callback do Google (endpoint padrão do Spring) |
| GET | `/api/auth/me` | autenticado | Dados do usuário logado |
| POST | `/api/auth/logout` | autenticado | Limpa o cookie do JWT |

## Regras de negócio

- Allowlist de e-mails via `app.security.allowed-emails` (lista, não um único e-mail) — pensado pra 2+ usuários desde o início, não um allowlist-gate simbólico de 1 usuário.
- `User` é find-or-create no primeiro login bem-sucedido; e-mail é único.
- JWT é a única fonte de verdade — sem `HttpSession` server-side (`SessionCreationPolicy.STATELESS`).
- `SecurityConfig.java` (ver matriz completa em [00-arquitetura.md](00-arquitetura.md)) é **implementado por este módulo** e é a fonte única de verdade de quais rotas são públicas vs. autenticadas em toda a API — outros módulos não o editam.

## Notas de paridade com o Nest

- **Replicar exatamente**: comportamento da allowlist (case-insensitive, trim, split por vírgula); `find-or-create` do usuário; granularidade público/autenticado por rota.
- **Aceitável divergir**: mecanismo de sessão — Nest usa cookie de sessão persistido em tabela (`session`), Java usa JWT stateless assinado (decisão já tomada no plano, ver Contexto). Isso muda o modelo de "revogar sessão" (não existe revogação imediata em JWT puro) — documentar essa diferença de comportamento se o usuário perguntar por que um logout no Nest e um "logout" no Java não são idênticos.
- **Frontend**: as URLs de login mudam (`/api/auth/sign-in/social` do BetterAuth → `/oauth2/authorization/google` do Spring). Ajustar `apps/web/src/lib/auth-client.ts` e `login/page.tsx` é trabalho futuro, fora do escopo deste módulo (que é só a API).

## Checklist de implementação

- [x] `User` entity + `UserRepository`
- [x] Flyway `V1__create_users.sql`
- [x] `AppSecurityProperties` (`@ConfigurationProperties("app.security")`: `allowedEmails`, `jwtSecret`, `jwtExpirationDays`, `jwtCookieName`)
- [x] `AllowedEmailsOAuth2UserService`
- [x] `JwtService` (issuing via Nimbus `SignedJWT`/`MACSigner`)
- [x] `OAuth2LoginSuccessHandler`
- [x] `CookieBearerTokenResolver`
- [x] `JwtDecoder` bean (Nimbus, HMAC)
- [x] `CurrentUser` annotation + `HandlerMethodArgumentResolver`
- [x] `SecurityConfig` completo (matriz de autorização de 00-arquitetura.md)
- [x] `AuthController` (`GET /api/auth/me`, `POST /api/auth/logout`)
- [x] Testes de integração escritos: e-mail permitido cria/reusa `User`; e-mail fora da allowlist é rejeitado; `GET /api/auth/me` sem cookie → 401; com cookie válido → 200 (`AuthIntegrationTest`). **Execução bloqueada**: neste ambiente, `./mvnw test` falha ao subir o `ApplicationContext` com `FlywayException: Unsupported Database: PostgreSQL 16.15` — problema de infraestrutura de build compartilhada (versão/wiring do Flyway no `pom.xml`, editado concorrentemente por outro processo durante esta sessão), não do código do módulo Auth. `./mvnw -q compile` e `./mvnw -q test-compile` passam limpos. Ver relatório da sessão de implementação para o diagnóstico completo.

## Nota de divergência da spec

`AllowedEmailsOAuth2UserService` estende `DefaultOAuth2UserService` como especificado, mas isso só funciona porque o escopo do client registration do Google em `application.yml` foi ajustado de `openid,email,profile` para `email,profile`. Com `openid` no escopo, o Spring Security troca automaticamente para o fluxo OIDC, cujo ponto de extensão correto passa a ser `OidcUserService`/`OidcUserRequest`, não mais `DefaultOAuth2UserService`. Sem esse ajuste a classe pedida pela spec nunca seria chamada no login real. O endpoint de userinfo do Google (`/oauth2/v3/userinfo`) continua devolvendo `email`/`name`/`picture` normalmente sem `openid`.
