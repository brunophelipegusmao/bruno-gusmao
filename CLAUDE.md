# CLAUDE.md — Guia para Assistência com IA

Este arquivo descreve a arquitetura, decisões técnicas e armadilhas comuns do projeto para que uma IA possa trabalhar nele de forma eficaz — ou para que alguém possa criar um projeto semelhante.

---

## Visão Geral do Projeto

Portfólio pessoal fullstack com painel administrativo. Monorepo com dois apps:

- **`apps/api`** — Backend NestJS 11 + Fastify, porta 3001 — **desativado**; mantido no repo por referência/histórico, mas o frontend não consome mais este backend.
- **`apps/web`** — Frontend Next.js 16 App Router, porta 3000. Consome exclusivamente `apps/api-java`.
- **`apps/api-java`** — Backend Spring Boot 4.1 (Java 21), **porta 3001** (assumiu a porta do Nest desativado) — backend real em produção. Ver seção "Migração Java" abaixo.

Gerenciador de pacotes: **pnpm workspaces** + **Turborepo** (orquestra build, lint, typecheck com cache). Scripts raiz usam `turbo run <task>`. `apps/api-java` fica fora do workspace pnpm — é um projeto Maven autocontido (`./mvnw`), sem `package.json`.

---

## Migração Java

`apps/api-java` é uma reimplementação em Spring Boot da API original em NestJS. O cutover já aconteceu: o frontend em `apps/web` consome `apps/api-java` (porta 3001), e `apps/api` (Nest) fica desativado/não usado, mantido só como referência histórica.

- Specs completos de cada módulo (modelo de dados, endpoints, regras de negócio, notas de paridade com o Nest): **`docs/java-migration/`** — comece pelo `docs/java-migration/README.md` (índice com status de cada módulo).
- Diferenças de arquitetura relevantes em relação ao Nest: auth é Google OAuth2 + JWT próprio em cookie httpOnly (não BetterAuth), ORM é JPA/Hibernate (não Drizzle), migrations são Flyway (não drizzle-kit), banco Postgres é **separado** do que o Nest usava.
- Se uma tarefa pedir para mexer na API, confirme com o usuário se é `apps/api` (Nest, desativado) ou `apps/api-java` (Spring, ativo) — os dois coexistem no repo e é fácil confundir.

---

## Decisões Arquiteturais Críticas

### Backend usa Fastify, NÃO Express

```ts
// CORRETO
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

// CORS com Fastify — usa @fastify/cors, NÃO app.enableCors()
await app.register(cors, {
  origin: process.env.WEB_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
});
```

Se usar `app.enableCors()` com Fastify, o CORS não funciona corretamente e DELETE/PATCH falham com preflight.

### UI usa @base-ui/react, NÃO Radix UI

```tsx
// CORRETO — @base-ui/react
import { Dialog } from "@base-ui/react/dialog";
// Usa `render` prop em vez de `asChild`
<Dialog.Popup className="..."> ... </Dialog.Popup>
<Dialog.Close render={<button className="...">Fechar</button>} />

// NÃO tem: DialogContent, DialogFooter, DialogCloseButton do Radix
```

A Sidebar é do shadcn (usa Radix internamente), mas todos os outros Dialogs/Dropdowns são @base-ui.

### SidebarMenuButton com Link

```tsx
// CORRETO — polymorphismo via `render` prop
<SidebarMenuButton render={<Link href={href} />} isActive={isActive}>
  <Icon /> <span>{label}</span>
</SidebarMenuButton>

// ERRADO — asChild não existe no @base-ui, mas sidebar é shadcn então asChild funcionaria
// porém o padrão do projeto usa render={}
```

### WebSocket — mesma porta da API (3001)

```ts
// main.ts
app.useWebSocketAdapter(new WsAdapter(app));
app.setGlobalPrefix('api'); // Afeta apenas HTTP, NÃO WebSocket

// Gateway conecta em ws://localhost:3001 (sem /api)
const ws = new WebSocket('ws://localhost:3001');
```

O `setGlobalPrefix('api')` não afeta o path do WebSocket. O WS fica na raiz `ws://localhost:3001`.

### TypingAnimation causa Hydration Mismatch

O componente `TypingAnimation` usa `framer-motion` que gera classes diferentes no servidor vs cliente. **Nunca usar em Server Components ou em layouts que são renderizados no servidor primeiro.**

```tsx
// CORRETO em layouts server-side (sidebar, etc.)
<span className="font-heading text-primary text-base tracking-widest">PAINEL_</span>

// TypingAnimation só é seguro em páginas client-side ou com `"use client"`
```

### AuthGuard — Granularidade por Método

O GET nas rotas de conteúdo é **público** (Next.js Server Components não enviam cookies). O guard fica apenas nos métodos de escrita:

```ts
// CORRETO
@Controller('api/kanban-tasks')
export class KanbanTasksController {
  @Get()           // público — sem @UseGuards
  findAll() { ... }

  @Post()
  @UseGuards(AuthGuard)  // protegido
  create() { ... }

  @Patch(':id')
  @UseGuards(AuthGuard)  // protegido
  update() { ... }

  @Delete(':id')
  @UseGuards(AuthGuard)  // protegido
  remove() { ... }
}
```

---

## Stack Técnica

### Backend (`apps/api`)
| Tecnologia | Versão | Uso |
|---|---|---|
| NestJS | 11 | Framework principal |
| Fastify | 5 | Adapter HTTP (não Express) |
| DrizzleORM | latest | ORM + migrations |
| drizzle-zod | latest | Schemas Zod gerados do DB |
| BetterAuth | latest | Autenticação (Google OAuth + email) |
| @nestjs/websockets + platform-ws | latest | WebSocket para Kanban |
| @nestjs/swagger | latest | Documentação API |
| postgres-js | latest | Driver PostgreSQL |

### Frontend (`apps/web`)
| Tecnologia | Versão | Uso |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| React | 19 | UI |
| Tailwind CSS | v4 | Estilização |
| @base-ui/react | latest | Primitivos UI (Dialog, Popover, etc.) |
| shadcn/ui | - | Componentes (Sidebar, Card, Table, Pagination) |
| @hello-pangea/dnd | latest | Drag-and-drop no Kanban |
| magicui | - | Componentes animados (AnimatedGridPattern) |

---

## Estrutura do Banco de Dados

```
badges         — id, name, slug, bgColor, textColor, createdAt
projects       — id, name, slug, summary, image, projectUrl, repoUrl,
                 badge1Id, badge2Id, badge3Id, visible, featured, kanbanStatus, createdAt, updatedAt
posts          — id, name, slug, summary, imageUrl, content,
                 badge1Id, badge2Id, badge3Id, visible, featured, kanbanStatus, createdAt, updatedAt
kanban_tasks   — id, title, description, taskType, color, kanbanStatus, createdAt, updatedAt
todos          — id, title, description, done, shared, ownerId, createdAt, updatedAt
site_settings  — id, eventPopupEnabled, eventName, eventDescription, eventImageUrl,
                 eventBgColor, eventTextColor, updatedAt
user           — gerenciado pelo BetterAuth
session        — gerenciado pelo BetterAuth
account        — gerenciado pelo BetterAuth
verification   — gerenciado pelo BetterAuth
```

**Kanban** é independente de projects/posts. O `kanbanStatus` em projects/posts é para organização interna no painel, mas o board Kanban só lê/escreve `kanban_tasks`.

**Badges** têm até 3 por item (badge1Id, badge2Id, badge3Id) — design denormalizado intencional para simplicidade.

**Todos** é a única tabela com dados por usuário: `ownerId` (FK → `user.id`, `onDelete: cascade`) marca o dono, e `shared` (boolean) decide se a tarefa aparece pra todo mundo autenticado ou só pro dono. Regra de leitura: `WHERE shared = true OR ownerId = <usuário atual>`. Regra de escrita: só o dono pode editar/apagar uma tarefa privada; uma tarefa compartilhada pode ser editada por qualquer usuário autenticado do painel — ver `apps/api/src/todos/todos.service.ts` (`assertMutable`). Esse é o padrão de referência para suportar múltiplos usuários no painel.

**Site Settings** é uma tabela singleton (uma única linha, criada sob demanda no primeiro `GET`) — não é um recurso com múltiplas linhas.

---

## Autenticação (BetterAuth)

Sistema **multi-usuário** por lista de e-mails permitidos (variável de ambiente `ALLOWED_EMAIL`, separada por vírgula — hoje já usada com 2 e-mails):

```ts
// apps/api/src/auth/auth.ts
const auth = betterAuth({
  // ...
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const allowedEmails = (process.env.ALLOWED_EMAIL ?? '')
            .split(',')
            .map((email) => email.toLowerCase().trim())
            .filter(Boolean);
          const incomingEmail = newUser.email?.toLowerCase().trim();
          if (!incomingEmail || !allowedEmails.includes(incomingEmail)) {
            throw new Error('Acesso negado.');
          }
        },
      },
    },
  },
  socialProviders: {
    google: { clientId: ..., clientSecret: ... }
  }
});
```

`ALLOWED_EMAIL=email1@gmail.com,email2@gmail.com` no `.env` — um ou mais e-mails, cada um vira um usuário real na tabela `user` no primeiro login bem-sucedido.

O guard lê o cookie `better-auth.session_token` e chama `auth.api.getSession({ headers })`. O BetterAuth aceita o token tanto via cookie quanto via header `Authorization: Bearer <token>`.

---

## Rotas da API

### Públicas (sem autenticação)
- `GET /api/badges` — lista todos os badges
- `GET /api/projects` — lista projetos com `visible=true`
- `GET /api/posts` — lista posts com `visible=true`
- `GET /api/posts/:slug` — busca post por slug
- `GET /api/kanban-tasks` — lista todas as tarefas do kanban

### Protegidas (requer sessão)
- `POST/PATCH/DELETE /api/badges/:id`
- `GET /api/projects/all` — lista todos (incluindo invisíveis)
- `POST/PATCH/DELETE /api/projects/:id`
- `GET /api/posts/all` — lista todos
- `POST/PATCH/DELETE /api/posts/:id`
- `POST/PATCH/DELETE /api/kanban-tasks/:id`

### WebSocket
- `ws://localhost:3001` — emite `move-card`, recebe `card-moved`

---

## Estrutura de Pastas

```
/
├── apps/
│   ├── api/
│   │   └── src/
│   │       ├── auth/          — guard + controller BetterAuth
│   │       ├── badges/        — módulo CRUD
│   │       ├── projects/      — módulo CRUD
│   │       ├── posts/         — módulo CRUD
│   │       ├── kanban/        — gateway WebSocket
│   │       ├── kanban-tasks/  — módulo CRUD independente
│   │       ├── db/
│   │       │   ├── index.ts   — instância DrizzleORM
│   │       │   └── schema/    — tabelas + schemas Zod
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── web/
│       └── src/
│           ├── app/            — estrutura plana, sem route groups
│           │   ├── login/      — /login (Google OAuth2 + e-mail/senha fora de produção)
│           │   ├── (páginas públicas na raiz) — /, /about, /projects, /blog, /blog/[slug]
│           │   └── ControlPanel/ — /ControlPanel/** (requer sessão, checada no layout.tsx)
│           └── components/
│               ├── Common/    — componentes reutilizáveis
│               │   ├── commonBadge.tsx   — badge colorido via style inline
│               │   ├── commonCard.tsx    — card de grid
│               │   ├── commonGrid.tsx    — grid paginado
│               │   └── featuredCard.tsx  — card destaque
│               ├── ControlPanel/
│               │   ├── appSidebar.tsx
│               │   ├── panelHeader.tsx
│               │   ├── projectsTable.tsx
│               │   ├── postsTable.tsx
│               │   ├── badgesTable.tsx
│               │   └── kanbanBoard.tsx
│               └── ui/        — shadcn + magicui components
└── packages/
    └── typescript-config/     — tsconfig base compartilhado
```

---

## Variáveis de Ambiente

### `apps/api/.env`
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
BETTER_AUTH_SECRET=seu-segredo-aqui
BETTER_AUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
ALLOWED_EMAIL=seu@email.com
WEB_URL=http://localhost:3000
PORT=3001
```

### `apps/web/.env.local`
```env
# Aponta pro backend Java (apps/api-java), não pro Nest (desativado):
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
API_URL=http://localhost:3001
```

---

## Comandos Essenciais

```bash
# Instalar dependências
pnpm install

# Rodar em desenvolvimento (ambos os apps simultaneamente)
pnpm dev

# Somente API
pnpm --filter api start:dev

# Somente Web
pnpm --filter web start:dev

# Gerar migration após alterar schema
pnpm --filter api db:generate

# Aplicar migrations
pnpm --filter api db:migrate

# Build de produção
pnpm build

# Typecheck em todos os apps
pnpm typecheck
```

---

## Padrões de Código

### Componentes Client vs Server

- Páginas de conteúdo público (`/projects`, `/blog`) → Server Components, `fetch()` direto
- Tabelas CRUD do painel → `"use client"`, `useState` + `fetch` no evento
- Kanban board → `"use client"`, WebSocket nativo + `@hello-pangea/dnd`

### CommonBadge

```tsx
// Sempre usar style inline — Tailwind não suporta classes dinâmicas de cor
<span
  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-heading uppercase tracking-wide"
  style={{ backgroundColor: bgColor, color: textColor }}
>
  {name}
</span>
```

### Fetch com tratamento de erro padrão

```ts
fetch(`${base}/api/endpoint`, { cache: 'no-store' })
  .then<T>((r) => r.ok ? r.json() : defaultValue)
```

### Módulo NestJS padrão

Cada feature tem: `module.ts`, `service.ts`, `controller.ts`. O service injeta o token `DRIZZLE` do `DbModule`. Registrar no `AppModule`.

---

## Armadilhas Comuns

1. **`app.enableCors()` não funciona com Fastify** — sempre usar `app.register(cors, { ... })`
2. **DELETE bloqueado por CORS** — incluir `methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']` explicitamente
3. **WebSocket ignora `setGlobalPrefix`** — conectar em `ws://host:port`, sem `/api`
4. **TypingAnimation em SSR** — causa hydration mismatch, usar apenas com `"use client"`
5. **GET protegido** — Server Components do Next.js não enviam cookies, então GET deve ser público
6. **@base-ui não tem `asChild`** — usar prop `render={<Component />}` para polimorfismo
7. **Tailwind v4 classes dinâmicas** — `bg-[${color}]` não funciona em runtime; usar `style={{ backgroundColor: color }}`
8. **Slug único** — posts e projects têm slug único; edições que mudam o slug precisam garantir unicidade
