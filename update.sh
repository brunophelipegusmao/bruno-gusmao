#!/usr/bin/env bash
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

echo "==> [1/4] Atualizando código..."
git pull origin master

echo "==> [2/4] Instalando dependências..."
pnpm install --frozen-lockfile

echo "==> [3/4] Build de produção..."
pnpm build

echo "==> [4/4] Rodando migrations e reiniciando apps..."
pnpm --filter api db:migrate
pm2 restart brunogusmao-api brunogusmao-web

echo ""
echo "Atualização concluída!"
pm2 status
