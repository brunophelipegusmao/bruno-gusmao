#!/usr/bin/env bash
# Atualização do bruno-gusmao (Docker): puxa o código, rebuilda e reinicia.
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/3] Atualizando código..."
git pull origin master

echo "==> [2/3] Build das imagens..."
docker compose build bruno_api bruno_web

echo "==> [3/3] Restart..."
# Migrations (Flyway) rodam automaticamente no boot do apps/api-java.
docker compose up -d bruno_api bruno_web

docker compose ps
echo ""
echo "Atualização concluída."
