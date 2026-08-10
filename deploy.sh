#!/usr/bin/env bash
# Deploy do bruno-gusmao em Docker. Nginx nativo do host expõe os containers
# publicamente — ver deploy/DEPLOY-VPS.md e scripts/vps-setup.sh (bootstrap).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/5] Validando pré-requisitos..."
if [ ! -f apps/api/.env ]; then
  echo "ERRO: apps/api/.env não existe. Rode: cp apps/api/.env.production.example apps/api/.env"
  echo "      (e preencha os valores — ou rode ./scripts/vps-setup.sh, que já faz isso)"
  exit 1
fi
echo "     OK"

echo "==> [2/5] Subindo PostgreSQL..."
docker compose up -d bruno_postgres
echo "     Aguardando banco..."
until docker compose exec -T bruno_postgres pg_isready -U brunogusmao -d bruno_gusmao -q; do sleep 1; done
echo "     Banco pronto."

echo "==> [3/5] Build das imagens..."
docker compose build bruno_api bruno_web

echo "==> [4/5] Migrations (antes de subir a app)..."
docker compose run --rm bruno_api pnpm db:migrate

echo "==> [5/5] Subindo API e Web..."
docker compose up -d bruno_api bruno_web
docker compose ps

echo ""
echo "Containers do bruno-gusmao no ar em 127.0.0.1:3000 (web) e 127.0.0.1:3001 (api)."
echo "Se ainda não rodou o bootstrap do Nginx/certbot, veja ./scripts/vps-setup.sh"
echo "e deploy/DEPLOY-VPS.md."
