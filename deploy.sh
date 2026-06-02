#!/usr/bin/env bash
# Deploy do bruno-gusmao em Docker, coexistindo com o outro sistema na VPS.
# Sobe APENAS os containers do bruno-gusmao. A integração com o nginx do outro
# sistema (configs + certificados) é feita à parte — ver deploy/INTEGRACAO-VPS.md.
set -euo pipefail
cd "$(dirname "$0")"

# Carrega variáveis do .env local (ex: SHARED_NETWORK=mgmt_internal)
[ -f .env ] && set -a && source .env && set +a

SHARED="${SHARED_NETWORK:-management-process-web_internal}"

echo "==> [1/5] Validando pré-requisitos..."
if [ ! -f apps/api/.env ]; then
  echo "ERRO: apps/api/.env não existe. Rode: cp apps/api/.env.production apps/api/.env"
  exit 1
fi
if ! docker network inspect "$SHARED" >/dev/null 2>&1; then
  echo "ERRO: a rede Docker compartilhada '$SHARED' não existe."
  echo "      Rode 'docker network ls' para achar a rede do outro sistema e defina-a"
  echo "      em um arquivo .env na raiz: echo 'SHARED_NETWORK=<nome>' > .env"
  exit 1
fi
echo "     OK (rede compartilhada: $SHARED)"

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
echo "Containers do bruno-gusmao no ar. Próximo passo: integrar ao nginx do outro"
echo "sistema (uma única vez) — veja deploy/INTEGRACAO-VPS.md."
