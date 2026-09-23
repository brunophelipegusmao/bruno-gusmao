#!/usr/bin/env bash
# Deploy do bruno-gusmao em Docker. Nginx nativo do host expõe os containers
# publicamente — ver deploy/DEPLOY-VPS.md e scripts/vps-setup.sh (bootstrap).
set -euo pipefail
cd "$(dirname "$0")"

echo "==> [1/5] Validando pré-requisitos..."
if [ ! -f apps/api-java/.env ]; then
  echo "ERRO: apps/api-java/.env não existe. Rode: cp apps/api-java/.env.production.example apps/api-java/.env"
  echo "      (e preencha os valores — ou rode ./scripts/vps-setup.sh, que já faz isso)"
  exit 1
fi
echo "     OK"

echo "==> [2/5] Subindo PostgreSQL..."
docker compose up -d bruno_postgres
echo "     Aguardando banco..."
until docker compose exec -T bruno_postgres pg_isready -U brunogusmao -d bruno_gusmao_java -q; do sleep 1; done
echo "     Banco pronto."

echo "     Garantindo que o database bruno_gusmao_java existe (volume pode ser de deploy antigo)..."
if ! docker compose exec -T bruno_postgres psql -U brunogusmao -d postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname = 'bruno_gusmao_java'" | grep -q 1; then
  docker compose exec -T bruno_postgres psql -U brunogusmao -d postgres -c "CREATE DATABASE bruno_gusmao_java"
fi

echo "==> [3/5] Build das imagens..."
docker compose build bruno_api bruno_web

echo "==> [4/5] Subindo API e Web..."
# Migrations (Flyway) rodam automaticamente no boot do apps/api-java, sem
# passo separado — diferente do Drizzle/Nest antigo.
docker compose up -d bruno_api bruno_web

echo "==> [5/5] Status..."
docker compose ps

echo ""
echo "Containers do bruno-gusmao no ar em 127.0.0.1:3000 (web) e 127.0.0.1:3001 (api-java)."
echo "Se ainda não rodou o bootstrap do Nginx/certbot, veja ./scripts/vps-setup.sh"
echo "e deploy/DEPLOY-VPS.md."
