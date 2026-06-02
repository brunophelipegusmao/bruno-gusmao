#!/usr/bin/env bash
set -euo pipefail
APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

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
