#!/usr/bin/env bash
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

# ── Pré-flight: não afetar o outro sistema da VPS ─────────────────────────────
echo "==> [0/8] Verificando portas (5432 / 3000 / 3001)..."
porta_em_uso() { ss -tlnH 2>/dev/null | awk '{print $4}' | grep -qE "[:.]$1\$"; }
CONFLITO=0
for p in 5432 3000 3001; do
  if porta_em_uso "$p"; then
    echo "     ⚠️  Porta $p já está em uso (provavelmente o outro sistema)."
    CONFLITO=1
  fi
done
if [ "$CONFLITO" = "1" ]; then
  echo ""
  echo "ERRO: há conflito de porta com outro serviço na VPS. Ajuste antes de continuar:"
  echo "  - 5432: altere o mapeamento no docker-compose.yml (ex: \"127.0.0.1:5433:5432\")"
  echo "          e o DATABASE_URL em apps/api/.env para a porta nova."
  echo "  - 3000/3001: altere PORT no ecosystem.config.js e os proxy_pass em nginx/brunogusmao.conf."
  exit 1
fi
echo "     Portas livres."

echo "==> [1/8] Instalando dependências..."
pnpm install --frozen-lockfile

echo "==> [2/8] Subindo PostgreSQL com Docker..."
docker compose up -d postgres
echo "     Aguardando banco ficar pronto..."
until docker compose exec -T postgres pg_isready -U brunogusmao -d bruno_gusmao -q; do sleep 1; done
echo "     Banco pronto."

echo "==> [3/8] Gerando ícone PWA 192px..."
# icon-512.png já existe (copiado de splash_screens/icon.png)
if [ ! -f apps/web/public/icons/icon-192.png ]; then
  if command -v convert &>/dev/null; then
    convert apps/web/public/icons/icon-512.png -resize 192x192 apps/web/public/icons/icon-192.png
    echo "     icon-192.png gerado com ImageMagick."
  else
    echo "     AVISO: ImageMagick não encontrado (apt install imagemagick)."
    echo "     Instale e re-execute, ou copie manualmente apps/web/public/icons/icon-192.png (192×192)."
  fi
else
  echo "     icon-192.png já existe, pulando."
fi

echo "==> [4/8] Build de produção..."
pnpm build

echo "==> [5/8] Rodando migrations do banco..."
pnpm --filter api db:migrate

echo "==> [6/8] Configurando Nginx..."
sudo cp nginx/brunogusmao.conf /etc/nginx/sites-available/brunogusmao
sudo ln -sf /etc/nginx/sites-available/brunogusmao /etc/nginx/sites-enabled/brunogusmao

# Adiciona o map de WebSocket ao nginx.conf principal caso não exista
if ! sudo grep -q 'connection_upgrade' /etc/nginx/nginx.conf; then
  echo "     Adicionando map WebSocket ao nginx.conf..."
  sudo sed -i '/http {/a\\tmap $http_upgrade $connection_upgrade { default upgrade; '"''"' close; }' /etc/nginx/nginx.conf
fi

sudo nginx -t
sudo nginx -s reload
echo "     Nginx recarregado."

echo "==> [7/8] Obtendo certificados HTTPS com Certbot..."
sudo certbot --nginx \
  -d brunogusmao.dev \
  -d www.brunogusmao.dev \
  -d api.brunogusmao.dev \
  --non-interactive --agree-tos -m bruno.mulim.prog@gmail.com
sudo nginx -s reload
echo "     HTTPS ativado."

echo "==> [8/8] Iniciando apps com PM2..."
pm2 delete brunogusmao-api brunogusmao-web 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "     Para registrar PM2 no boot do sistema execute: pm2 startup"

echo ""
echo "╔══════════════════════════════════════╗"
echo "  Deploy concluído!"
echo "  Web  → https://brunogusmao.dev"
echo "  API  → https://api.brunogusmao.dev"
echo "  Docs → https://api.brunogusmao.dev/docs"
echo "╚══════════════════════════════════════╝"
