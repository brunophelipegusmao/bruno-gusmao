# Bruno Gusmão — Portfólio Fullstack

Portfólio pessoal com painel administrativo completo. Monorepo **pnpm workspaces + Turborepo** com backend NestJS + Fastify, frontend Next.js 16 App Router, autenticação via BetterAuth (Google OAuth), Kanban em tempo real com WebSocket e drag-and-drop.

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Técnica](#stack-técnica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Rodando o Projeto](#rodando-o-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Rotas da API](#rotas-da-api)
- [Documentação Swagger](#documentação-swagger)
- [Kanban WebSocket](#kanban-websocket)
- [Deploy](#deploy)

---

## Sobre o Projeto

Este repositório é um monorepo pnpm que reúne a API REST e o site do portfólio. O objetivo é ter um lugar centralizado para apresentar projetos e artigos, com um painel administrativo para gerenciar todo o conteúdo sem depender de serviços externos de CMS.

O design segue uma estética terminal/hacker: tipografia monospace, animações de digitação e uma paleta dark com acentos em verde-lima (`#bef264`).

---

## Funcionalidades

### Área Pública
- Página inicial com animação de grid e apresentação pessoal
- Página Sobre com seções de perfil, experiências e contato
- Página de Projetos com card em destaque e grid paginado
- Blog com card em destaque, grid paginado e página de leitura por slug
- Leitura estimada e formatação de data em português no blog
- Renderizador de Markdown embutido (títulos, listas, blocos de código, parágrafos)
- Badges coloridos com cor de fundo e texto configuráveis

### Painel Administrativo (`/ControlPanel`)
- **Dashboard** — contagem de projetos, posts, badges e tarefas kanban
- **Projetos** — CRUD completo, toggle de visibilidade pública, status kanban
- **Posts** — CRUD completo com campo de conteúdo Markdown, toggle de visibilidade
- **Badges** — CRUD com seletor de cor, preview ao vivo do badge
- **Kanban** — board em tempo real com drag-and-drop; tarefas independentes dos projetos/posts
  - 4 colunas: Backlog · To Do · In Progress · Done
  - 3 tipos de tarefa: Blog (azul `#3C71C8`), Projeto (roxo `#4c1d95`), Custom (cor livre)
  - Sincronização via WebSocket entre múltiplas abas
  - Criar, editar e excluir diretamente do card

---

## Stack Técnica

### Backend — `apps/api`
| Tecnologia | Descrição |
|---|---|
| NestJS 11 | Framework Node.js com injeção de dependência |
| Fastify 5 | Adapter HTTP (não Express) |
| DrizzleORM | ORM type-safe com migrations |
| drizzle-zod | Geração automática de schemas Zod do DB |
| BetterAuth | Autenticação com Google OAuth |
| @nestjs/websockets + platform-ws | Gateway WebSocket nativo |
| @nestjs/swagger | Documentação OpenAPI 3 |
| postgres-js | Driver PostgreSQL |

### Frontend — `apps/web`
| Tecnologia | Descrição |
|---|---|
| Next.js 16 | App Router, Server Components |
| React 19 | UI |
| Tailwind CSS v4 | Utility-first CSS |
| @base-ui/react | Primitivos UI acessíveis (Dialog, Switch, etc.) |
| shadcn/ui | Componentes prontos (Sidebar, Table, Pagination, Card) |
| @hello-pangea/dnd | Drag-and-drop para o Kanban |
| magicui | Componentes animados (AnimatedGridPattern) |

---

## Pré-requisitos

- Node.js >= 20
- pnpm >= 10
- PostgreSQL (local ou remoto)
- Credenciais Google OAuth (para login)

---

## Instalação

```bash
# Clonar o repositório
git clone <url-do-repo>
cd bruno-gusmao

# Instalar todas as dependências dos workspaces
pnpm install
```

---

## Configuração

### API — `apps/api/.env`

```env
# Banco de dados PostgreSQL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco

# BetterAuth — gere um segredo forte (ex: openssl rand -hex 32)
BETTER_AUTH_SECRET=seu-segredo-aqui
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=seu-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-google-client-secret

# Controle de acesso — apenas este email pode se registrar
ALLOWED_EMAIL=seu@email.com

# URL do frontend (para CORS)
WEB_URL=http://localhost:3000

# Porta da API (padrão: 3001)
PORT=3001
```

### Web — `apps/web/.env.local`

```env
# URL da API
NEXT_PUBLIC_API_URL=http://localhost:3001

# URL do BetterAuth (mesmo da API)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
```

### Banco de Dados

```bash
# Gerar os arquivos de migration a partir do schema
pnpm --filter api db:generate

# Aplicar as migrations no banco
pnpm --filter api db:migrate
```

---

## Rodando o Projeto

```bash
# Rodar API e Web simultaneamente em modo desenvolvimento
pnpm dev

# Rodar apenas a API
pnpm --filter api start:dev

# Rodar apenas o frontend
pnpm --filter web start:dev

# Build de produção (ambos)
pnpm build

# Verificar tipos TypeScript
pnpm typecheck
```

| App | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/docs |
| WebSocket | ws://localhost:3001 |

---

## Estrutura de Pastas

```
.
├── apps/
│   ├── api/                        # Backend NestJS
│   │   └── src/
│   │       ├── auth/               # Guard de autenticação + controller BetterAuth
│   │       ├── badges/             # CRUD de badges
│   │       ├── projects/           # CRUD de projetos
│   │       ├── posts/              # CRUD de posts
│   │       ├── kanban/             # Gateway WebSocket
│   │       ├── kanban-tasks/       # CRUD de tarefas independentes do Kanban
│   │       ├── db/
│   │       │   ├── index.ts        # Instância DrizzleORM
│   │       │   └── schema/         # Definição das tabelas + schemas Zod
│   │       ├── app.module.ts
│   │       └── main.ts             # Bootstrap: Fastify, CORS, WS, Swagger
│   │
│   └── web/                        # Frontend Next.js
│       └── src/
│           ├── app/
│           │   ├── (auth)/         # /login, /register
│           │   ├── (public)/       # /, /about, /projects, /blog, /blog/[slug]
│           │   └── (private)/      # /ControlPanel/** (autenticado)
│           └── components/
│               ├── Common/         # Componentes reutilizáveis públicos e privados
│               ├── ControlPanel/   # Componentes exclusivos do painel
│               └── ui/             # shadcn/ui + magicui
│
└── packages/
    └── typescript-config/          # tsconfig base compartilhado
```

### Banco de Dados — Tabelas

| Tabela | Descrição |
|---|---|
| `badges` | Tags coloridas reutilizáveis |
| `projects` | Projetos com visibilidade e status kanban |
| `posts` | Artigos do blog com conteúdo Markdown |
| `kanban_tasks` | Tarefas do board Kanban (independentes) |
| `user` | Gerenciada pelo BetterAuth |
| `session` | Gerenciada pelo BetterAuth |
| `account` | Gerenciada pelo BetterAuth |
| `verification` | Gerenciada pelo BetterAuth |

---

## Rotas da API

### Públicas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/badges` | Lista todos os badges |
| GET | `/api/projects` | Lista projetos visíveis |
| GET | `/api/posts` | Lista posts visíveis |
| GET | `/api/posts/:slug` | Busca post pelo slug |
| GET | `/api/kanban-tasks` | Lista todas as tarefas do kanban |

### Protegidas (requer sessão)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/badges` | Cria badge |
| PATCH | `/api/badges/:id` | Atualiza badge |
| DELETE | `/api/badges/:id` | Remove badge |
| GET | `/api/projects/all` | Lista todos os projetos (incluindo invisíveis) |
| POST | `/api/projects` | Cria projeto |
| PATCH | `/api/projects/:id` | Atualiza projeto |
| DELETE | `/api/projects/:id` | Remove projeto |
| GET | `/api/posts/all` | Lista todos os posts |
| POST | `/api/posts` | Cria post |
| PATCH | `/api/posts/:id` | Atualiza post |
| DELETE | `/api/posts/:id` | Remove post |
| POST | `/api/kanban-tasks` | Cria tarefa kanban |
| PATCH | `/api/kanban-tasks/:id` | Atualiza tarefa |
| DELETE | `/api/kanban-tasks/:id` | Remove tarefa |

---

## Documentação Swagger

Acesse `http://localhost:3001/docs` com a API rodando.

**Para autenticar nas rotas protegidas:**
1. Faça login em `http://localhost:3000/login`
2. Abra o DevTools → aba **Application** → **Cookies**
3. Copie o valor de `better-auth.session_token`
4. Clique em **Authorize** no Swagger e cole o valor no campo **Bearer**

---

## Kanban WebSocket

O board Kanban usa WebSocket nativo para sincronização em tempo real entre abas.

**Conectar:** `ws://localhost:3001`

**Mover card:**
```json
{
  "event": "move-card",
  "data": {
    "id": "uuid-da-tarefa",
    "type": "task",
    "to": "in-progress"
  }
}
```

**Status possíveis:** `backlog` · `todo` · `in-progress` · `done`

O servidor emite `card-moved` com os mesmos dados para todos os clientes conectados, atualizando o board em tempo real.

---

## Deploy

O monorepo usa **Turborepo** para orquestrar builds com cache inteligente entre os workspaces.

A aplicação roda em produção numa VPS própria (Docker + Nginx nativo + certbot),
em `brunogusmao.dev`/`api.brunogusmao.dev`, coexistindo na mesma VPS com o
subdomínio do evento-gamificacao. Não há deploy na Vercel/Railway.

Ver runbook completo, incluindo bootstrap da VPS do zero e coordenação com o
evento-gamificacao: [`deploy/DEPLOY-VPS.md`](./deploy/DEPLOY-VPS.md).

**Resumo rápido (VPS já provisionada):**
```bash
./scripts/vps-setup.sh   # uma única vez, numa VPS nova
./deploy.sh               # primeiro deploy
./update.sh                # deploys seguintes
```

---

---

# Bruno Gusmão — Fullstack Portfolio

Personal portfolio with a complete admin panel. NestJS + Fastify backend, Next.js 16 App Router frontend, BetterAuth authentication (Google OAuth), real-time Kanban board via WebSocket and drag-and-drop.

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Folder Structure](#folder-structure)
- [API Routes](#api-routes)
- [Swagger Documentation](#swagger-documentation)
- [Kanban WebSocket](#kanban-websocket-1)

---

## About

This pnpm workspaces monorepo brings together the REST API and portfolio website. Scripts are orchestrated with `pnpm -r --parallel` — no Turborepo. The goal is to have a centralized place to showcase projects and articles, with an admin panel to manage all content without relying on external CMS services.

The design follows a terminal/hacker aesthetic: monospace typography, typing animations, and a dark palette with lime-green accents (`#bef264`).

---

## Features

### Public Area
- Home page with animated grid and personal introduction
- About page with profile, experience, and contact sections
- Projects page with a featured card and paginated grid
- Blog with a featured card, paginated grid, and reading page by slug
- Estimated reading time and date formatting in Portuguese on the blog
- Built-in Markdown renderer (headings, lists, code blocks, paragraphs)
- Colored badges with configurable background and text color

### Admin Panel (`/ControlPanel`)
- **Dashboard** — project, post, badge, and kanban task counts
- **Projects** — full CRUD, public visibility toggle, kanban status
- **Posts** — full CRUD with Markdown content field, visibility toggle
- **Badges** — CRUD with color picker and live badge preview
- **Kanban** — real-time board with drag-and-drop; tasks independent from projects/posts
  - 4 columns: Backlog · To Do · In Progress · Done
  - 3 task types: Blog (blue `#3C71C8`), Project (purple `#4c1d95`), Custom (free color)
  - WebSocket sync across multiple browser tabs
  - Create, edit, and delete directly from the card

---

## Tech Stack

### Backend — `apps/api`
| Technology | Description |
|---|---|
| NestJS 11 | Node.js framework with dependency injection |
| Fastify 5 | HTTP adapter (not Express) |
| DrizzleORM | Type-safe ORM with migrations |
| drizzle-zod | Automatic Zod schema generation from DB |
| BetterAuth | Authentication with Google OAuth |
| @nestjs/websockets + platform-ws | Native WebSocket gateway |
| @nestjs/swagger | OpenAPI 3 documentation |
| postgres-js | PostgreSQL driver |

### Frontend — `apps/web`
| Technology | Description |
|---|---|
| Next.js 16 | App Router, Server Components |
| React 19 | UI |
| Tailwind CSS v4 | Utility-first CSS |
| @base-ui/react | Accessible UI primitives (Dialog, Switch, etc.) |
| shadcn/ui | Ready-made components (Sidebar, Table, Pagination, Card) |
| @hello-pangea/dnd | Drag-and-drop for Kanban |
| magicui | Animated components (AnimatedGridPattern) |

---

## Prerequisites

- Node.js >= 20
- pnpm >= 10
- PostgreSQL (local or remote)
- Google OAuth credentials (for login)

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd bruno-gusmao

# Install all workspace dependencies
pnpm install
```

---

## Configuration

### API — `apps/api/.env`

```env
# PostgreSQL database
DATABASE_URL=postgresql://user:password@localhost:5432/database_name

# BetterAuth — generate a strong secret (e.g.: openssl rand -hex 32)
BETTER_AUTH_SECRET=your-secret-here
BETTER_AUTH_URL=http://localhost:3001

# Google OAuth — console.cloud.google.com
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Access control — only this email can register
ALLOWED_EMAIL=your@email.com

# Frontend URL (for CORS)
WEB_URL=http://localhost:3000

# API port (default: 3001)
PORT=3001
```

### Web — `apps/web/.env.local`

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# BetterAuth URL (same as API)
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
```

### Database

```bash
# Generate migration files from schema
pnpm --filter api db:generate

# Apply migrations to database
pnpm --filter api db:migrate
```

---

## Running the Project

```bash
# Run API and Web simultaneously in development mode
pnpm dev

# Run only the API
pnpm --filter api start:dev

# Run only the frontend
pnpm --filter web start:dev

# Production build (both)
pnpm build

# TypeScript type checking
pnpm typecheck
```

| App | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/docs |
| WebSocket | ws://localhost:3001 |

---

## Folder Structure

```
.
├── apps/
│   ├── api/                        # NestJS Backend
│   │   └── src/
│   │       ├── auth/               # Auth guard + BetterAuth controller
│   │       ├── badges/             # Badges CRUD
│   │       ├── projects/           # Projects CRUD
│   │       ├── posts/              # Posts CRUD
│   │       ├── kanban/             # WebSocket gateway
│   │       ├── kanban-tasks/       # Independent Kanban tasks CRUD
│   │       ├── db/
│   │       │   ├── index.ts        # DrizzleORM instance
│   │       │   └── schema/         # Table definitions + Zod schemas
│   │       ├── app.module.ts
│   │       └── main.ts             # Bootstrap: Fastify, CORS, WS, Swagger
│   │
│   └── web/                        # Next.js Frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/         # /login, /register
│           │   ├── (public)/       # /, /about, /projects, /blog, /blog/[slug]
│           │   └── (private)/      # /ControlPanel/** (authenticated)
│           └── components/
│               ├── Common/         # Reusable components (public + private)
│               ├── ControlPanel/   # Panel-exclusive components
│               └── ui/             # shadcn/ui + magicui
│
└── packages/
    └── typescript-config/          # Shared tsconfig base
```

### Database Tables

| Table | Description |
|---|---|
| `badges` | Reusable colored tags |
| `projects` | Projects with visibility and kanban status |
| `posts` | Blog articles with Markdown content |
| `kanban_tasks` | Kanban board tasks (independent) |
| `user` | Managed by BetterAuth |
| `session` | Managed by BetterAuth |
| `account` | Managed by BetterAuth |
| `verification` | Managed by BetterAuth |

---

## API Routes

### Public
| Method | Route | Description |
|---|---|---|
| GET | `/api/badges` | List all badges |
| GET | `/api/projects` | List visible projects |
| GET | `/api/posts` | List visible posts |
| GET | `/api/posts/:slug` | Get post by slug |
| GET | `/api/kanban-tasks` | List all kanban tasks |

### Protected (requires session)
| Method | Route | Description |
|---|---|---|
| POST | `/api/badges` | Create badge |
| PATCH | `/api/badges/:id` | Update badge |
| DELETE | `/api/badges/:id` | Delete badge |
| GET | `/api/projects/all` | List all projects (including hidden) |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/posts/all` | List all posts |
| POST | `/api/posts` | Create post |
| PATCH | `/api/posts/:id` | Update post |
| DELETE | `/api/posts/:id` | Delete post |
| POST | `/api/kanban-tasks` | Create kanban task |
| PATCH | `/api/kanban-tasks/:id` | Update task |
| DELETE | `/api/kanban-tasks/:id` | Delete task |

---

## Swagger Documentation

Visit `http://localhost:3001/docs` with the API running.

**To authenticate on protected routes:**
1. Log in at `http://localhost:3000/login`
2. Open DevTools → **Application** tab → **Cookies**
3. Copy the value of `better-auth.session_token`
4. Click **Authorize** in Swagger and paste the value in the **Bearer** field

---

## Kanban WebSocket

The Kanban board uses native WebSocket for real-time synchronization across tabs.

**Connect:** `ws://localhost:3001`

**Move a card:**
```json
{
  "event": "move-card",
  "data": {
    "id": "task-uuid",
    "type": "task",
    "to": "in-progress"
  }
}
```

**Available statuses:** `backlog` · `todo` · `in-progress` · `done`

The server emits `card-moved` with the same data to all connected clients, updating the board in real time.

---

## Deploy

The monorepo uses **Turborepo** to orchestrate builds with intelligent cross-workspace caching.

The app runs in production on a dedicated VPS (Docker + native Nginx + certbot)
at `brunogusmao.dev`/`api.brunogusmao.dev`, coexisting on the same VPS with the
evento-gamificacao subdomain. There is no Vercel/Railway deploy.

Full runbook, including bootstrapping the VPS from scratch and coordination
with evento-gamificacao: [`deploy/DEPLOY-VPS.md`](./deploy/DEPLOY-VPS.md).

**Quick reference (VPS already provisioned):**
```bash
./scripts/vps-setup.sh   # once, on a fresh VPS
./deploy.sh                # first deploy
./update.sh                 # subsequent deploys
```
