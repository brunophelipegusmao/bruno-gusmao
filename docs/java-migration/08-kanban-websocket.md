# Kanban WebSocket — Spec

**Status:** ✅ Concluído
**Depende de:** Projects, Posts, Kanban Tasks, Todos, Auth
**Fonte no Nest:** `apps/api/src/kanban/kanban.gateway.ts`, `apps/api/src/kanban/kanban.module.ts`, `apps/api/src/todos/todos.gateway.ts`, `apps/api/src/main.ts` (`app.useWebSocketAdapter`, `setGlobalPrefix`)

Dois handlers WebSocket, registrados **sem prefixo `/api`** (ver convenção #1 em [00-arquitetura.md](00-arquitetura.md)), na mesma porta HTTP da aplicação (`PORT`, hoje 3002) — não uma porta separada.

## Modelo de dados

Sem entidades próprias — este módulo só orquestra broadcasts sobre entidades de outros módulos (`Project`, `Post`, `KanbanTask`, `Todo`).

## Endpoints (WebSocket)

| Path | Guarda | Descrição |
|---|---|---|
| `/ws/kanban` | pública no handshake (replica gap do Nest — ver Notas) | Recebe `{event: "move-card", data: {id, type: project\|post\|task, to}}`; emite `{event: "card-moved", data}` pra todos os clientes conectados |
| `/ws/todos` | handshake autenticado via `HandshakeInterceptor` | Emite `todo-created`/`todo-updated`/`todo-deleted`, filtrado por sessão |

## Regras de negócio

### `KanbanWebSocketHandler`
- Recebe `move-card`, resolve pelo `type` (`project`/`post`/`task`) qual service chamar (`ProjectService.update`, `PostService.update` ou `KanbanTaskService.update`) para persistir o novo `kanbanStatus`.
- Faz broadcast de `card-moved` pra **todos** os clientes conectados no handler (sem filtro por usuário).
- **Sem autenticação no handshake** — isso replica um gap identificado no Nest (`handleMoveCard` não checa guard nenhum). Recomendação: manter paridade 1:1 na v1 (não foi pedido mudar esse comportamento), mas deixar um comentário `// TODO` no código apontando que isso deveria exigir um JWT válido no handshake numa iteração futura de hardening.

### `TodosWebSocketHandler`
- `HandshakeInterceptor.beforeHandshake`: lê o cookie do JWT da requisição de upgrade, valida via o mesmo mecanismo de verificação do resto da API (`JwtDecoder`/Nimbus do módulo Auth). Inválido ou ausente → recusa o handshake (equivalente ao `client.close(1008, 'Unauthorized')` do Nest). Válido → grava `userId` nos atributos da `WebSocketSession`.
- Broadcast filtrado: ao enviar `todo-created`/`todo-updated`/`todo-deleted`, só envia pra sessões onde `todo.isShared() || session.getAttributes().get("userId").equals(todo.getOwner().getId())` — replica exatamente `todos.gateway.ts`.
- Este handler é chamado pelo `TodoService` (create/update/remove) — não pelo controller diretamente, mesmo padrão do Nest (`TodosGateway` injetado no `TodosService`).

## Notas de paridade com o Nest

- **Sem prefixo `/api`**: como o WebSocket não usa `context-path` nem `@RequestMapping`, registrar os handlers via `WebSocketConfigurer.registerWebSocketHandlers()` diretamente em `/ws/kanban` e `/ws/todos` já resolve isso — não há necessidade de configuração extra.
- Gap de autenticação do Kanban WS é intencional (ver acima) — não "consertar" silenciosamente sem avisar, documentar a decisão no código e no PR/commit.
- O filtro de broadcast de Todos precisa considerar reconexões — se um cliente desconecta, sua sessão deve ser removida do registro de conexões ativas (`afterConnectionClosed`), senão o handler tenta enviar pra sessões mortas.

## Checklist de implementação

- [x] `WebSocketConfig` (`config/WebSocketConfig.java`, implementa `WebSocketConfigurer`, registra os dois handlers sem prefixo)
- [x] `KanbanWebSocketHandler` (`TextWebSocketHandler`)
- [x] `TodosWebSocketHandler` (`TextWebSocketHandler`) + `JwtHandshakeInterceptor`
- [x] Injeção do `TodosWebSocketHandler` no `TodoService` para broadcast em create/update/remove
- [x] Testes automatizados: `KanbanWebSocketIT` cobre conectar em `/ws/kanban` sem autenticação, mandar `move-card`, receber `card-moved` em **todos** os clientes conectados (não só quem enviou) e confirmar a persistência real no Postgres (Testcontainers). `TodosWebSocketHandler`/`JwtHandshakeInterceptor` não ganharam um IT dedicado nesta rodada — ver nota abaixo.

## Notas de implementação (rodada de conclusão)

- **Localização**: `dev.brunogusmao.api.kanban` — `KanbanWebSocketHandler`, `TodosWebSocketHandler`, `JwtHandshakeInterceptor`, `dto/CardMovePayload`, `dto/KanbanSocketMessage`, `dto/TodoSocketMessage`. `WebSocketConfig` fica em `dev.brunogusmao.api.config`, como os demais `*Config`.
- **Decisão de injeção do broadcast em Todos**: `TodoService` recebe `TodosWebSocketHandler` por injeção de construtor comum, **sem `@Lazy`**. Não existe ciclo de beans real a evitar — `TodosWebSocketHandler` não depende de `TodoService` (só de sessões WebSocket + Jackson) —, então o grafo do Spring continua acíclico mesmo com `TodoService -> TodosWebSocketHandler`. O único "ciclo" é a nível de pacote Java (`todos` importa `kanban.TodosWebSocketHandler`, `kanban` importa `todos.dto.TodoResponse`), o que o Java permite sem problema; mesmo padrão do Nest (`TodosGateway` injetado direto em `TodosService`).
- **`ObjectMapper` local em cada handler**: mesma armadilha documentada em `06-todos.md` — o bean autoconfigurado do Spring Boot 4.1.1 é Jackson 3 (`tools.jackson.databind`), não o clássico `com.fasterxml.jackson.databind` usado aqui. `TodosWebSocketHandler` registra `JavaTimeModule` na sua instância local (diferente do handler do kanban) porque `TodoResponse` tem campos `Instant` (`createdAt`/`updatedAt`) que precisam de serialização ISO-8601.
- **Formato do `KanbanStatus` no wire do WebSocket**: serializado como o nome do enum Java (`"BACKLOG"`, `"IN_PROGRESS"`, etc.), não como as strings kebab-case do Nest (`"backlog"`, `"in-progress"`). Isso é consistente com o resto da API Java (REST responses de `/api/projects`, `/api/posts`, `/api/kanban-tasks` já serializam `kanbanStatus` da mesma forma, sem customização de enum) — não é uma divergência introduzida por este módulo, é o padrão já estabelecido nos módulos anteriores.
- **Teste de `KanbanWebSocketIT`**: usa `StandardWebSocketClient` (JSR-356 via Tomcat embarcado, já no classpath transitivamente por `spring-boot-starter-web`) contra `@SpringBootTest(webEnvironment = RANDOM_PORT)` + Testcontainers Postgres. Cobre: (1) handshake sem nenhuma credencial funciona (paridade com o gap intencional); (2) `move-card` para uma `KanbanTask` real persistida no banco é aplicado via `KanbanTaskService.update` e o broadcast `card-moved` chega a **dois** clientes conectados simultaneamente (quem enviou e um observador), confirmando o "todos os clientes conectados" da spec — não só um eco pro remetente.
- **Teste de `/ws/todos` (handshake JWT + filtro shared/owner)**: **não foi implementado nesta rodada** — priorizado o Kanban conforme instruído. `JwtHandshakeInterceptor` reusa exatamente `JwtService.verify(...)` (já testado indiretamente por `AuthIntegrationTest`/`TodoControllerIT` via `JwtService.generateToken`) e o filtro de broadcast em `TodosWebSocketHandler.broadcast` replica lido-a-lido a condição `todo.shared() || todo.ownerId().equals(sessionUserId)` de `todos.gateway.ts`. Verificação feita por: compilação limpa (`./mvnw -q compile`), leitura cruzada com `SecurityConfig`/`CookieBearerTokenResolver` (mesma fonte do nome do cookie via `AppSecurityProperties`) e `./mvnw verify` completo (42/42 testes Failsafe + 5/5 Surefire) sem regressão em `TodoControllerIT` após adicionar o novo parâmetro de construtor em `TodoService`. Um IT dedicado para `/ws/todos` (handshake sem cookie recusado com 401; broadcast filtrado por dois usuários) fica como próximo passo caso se queira fechar 100% a cobertura automatizada deste submódulo.
