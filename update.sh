#!/usr/bin/env bash
# Atualização do bruno-gusmao (Docker): puxa o código, rebuilda e reinicia.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/3] Atualizando código..."
git pull origin master

echo "==> [2/3] Build das imagens..."
docker compose build bruno_api bruno_web

echo "==> [3/3] Migrations + restart..."
docker compose run --rm bruno_api pnpm db:migrate
docker compose up -d bruno_api bruno_web

docker compose ps
echo ""
echo "Atualização concluída."
