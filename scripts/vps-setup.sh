#!/usr/bin/env bash
# Bootstrap ÚNICO da VPS (Ubuntu/Debian) para hospedar o bruno-gusmao.
# Idempotente: pode ser reexecutado com segurança (cada etapa checa se já
# foi feita), mas foi desenhado pra rodar uma vez numa VPS nova.
#
# Instala a infra COMPARTILHADA da VPS (Docker, Nginx, certbot, ufw) — se você
# também vai hospedar o evento-gamificacao nesta mesma VPS, rode este script
# ANTES do scripts/vps-setup.sh dele (ver deploy/DEPLOY-VPS.md).
#
# Depois de terminar, use ./deploy.sh a cada novo deploy.
#
# Uso:
#   ssh sua-vps
#   git clone <url-do-repo-bruno-gusmao> ~/apps/bruno-gusmao
#   cd ~/apps/bruno-gusmao
#   LETSENCRYPT_EMAIL=seu@email.com ./scripts/vps-setup.sh

set -euo pipefail

# ===== Config (sobrescreva via env var antes de rodar, se precisar) =====
DOMAIN_WEB="${DOMAIN_WEB:-brunogusmao.dev}"
DOMAIN_API="${DOMAIN_API:-api.brunogusmao.dev}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-}"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Só usa sudo se não estiver rodando como root.
SUDO="sudo"
[ "$(id -u)" = "0" ] && SUDO=""

log() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

log "Config: DOMAIN_WEB=$DOMAIN_WEB DOMAIN_API=$DOMAIN_API REPO_DIR=$REPO_DIR"

# ===== 1. Pacotes base =====
log "Atualizando apt e instalando pré-requisitos"
$SUDO apt-get update -y
$SUDO apt-get install -y ca-certificates curl gnupg git ufw openssl

# ===== 2. Docker Engine + compose plugin =====
if ! command -v docker &>/dev/null; then
  log "Instalando Docker Engine"
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null
  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  log "Docker já instalado, pulando"
fi

if ! id -nG "$USER" | grep -qw docker; then
  log "Adicionando $USER ao grupo docker (efetivo só no próximo login/shell)"
  $SUDO usermod -aG docker "$USER"
  NEEDS_RELOGIN=1
fi

# ===== 3. Firewall =====
log "Configurando ufw (libera só SSH, 80 e 443)"
$SUDO ufw allow OpenSSH
$SUDO ufw allow 80/tcp
$SUDO ufw allow 443/tcp
$SUDO ufw --force enable

# ===== 4. Nginx + certbot (infra compartilhada da VPS) =====
if ! command -v nginx &>/dev/null; then
  log "Instalando Nginx"
  $SUDO apt-get install -y nginx
else
  log "Nginx já instalado, pulando"
fi

if ! command -v certbot &>/dev/null; then
  log "Instalando certbot"
  $SUDO apt-get install -y certbot python3-certbot-nginx
else
  log "certbot já instalado, pulando"
fi

# ===== 5. apps/api/.env (produção) =====
ENV_FILE="$REPO_DIR/apps/api/.env"
if [ ! -f "$ENV_FILE" ]; then
  log "Criando $ENV_FILE a partir do template"
  cp "$REPO_DIR/apps/api/.env.production.example" "$ENV_FILE"

  BETTER_AUTH_SECRET_GENERATED="$(openssl rand -base64 32)"
  sed -i "s#^BETTER_AUTH_SECRET=.*#BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET_GENERATED}#" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
else
  log "$ENV_FILE já existe, não sobrescrevendo"
fi

# ===== 6. Nginx: server blocks de brunogusmao.dev e api.brunogusmao.dev =====
log "Configurando Nginx para ${DOMAIN_WEB} e ${DOMAIN_API}"
for DOMAIN in "$DOMAIN_WEB" "$DOMAIN_API"; do
  $SUDO cp "$REPO_DIR/deploy/nginx/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}.conf"
  $SUDO ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
done
$SUDO nginx -t
$SUDO systemctl reload nginx

# ===== 7. SSL via certbot (certificado único cobrindo os 3 nomes) =====
if [ -n "$LETSENCRYPT_EMAIL" ]; then
  log "Emitindo certificado SSL para ${DOMAIN_WEB}, www.${DOMAIN_WEB} e ${DOMAIN_API}"
  $SUDO certbot --nginx \
    -d "$DOMAIN_WEB" -d "www.$DOMAIN_WEB" -d "$DOMAIN_API" \
    -m "$LETSENCRYPT_EMAIL" --agree-tos --non-interactive --redirect
else
  log "LETSENCRYPT_EMAIL não definido — pulei o certbot."
  echo "Rode manualmente depois de apontar o DNS:"
  echo "  sudo certbot --nginx -d ${DOMAIN_WEB} -d www.${DOMAIN_WEB} -d ${DOMAIN_API}"
fi

# ===== Resumo =====
log "Setup concluído"
echo "Repo dir:  $REPO_DIR"
echo "Env file:  $ENV_FILE"
echo
echo "Falta antes do primeiro deploy:"
echo "  1. Confirmar DNS: ${DOMAIN_WEB}, www.${DOMAIN_WEB}, ${DOMAIN_API} -> IP desta VPS"
echo "  2. Preencher DATABASE_URL (senha do Postgres) / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / ALLOWED_EMAIL em $ENV_FILE"
echo "     (redirect URI no Google Console: https://${DOMAIN_API}/api/auth/callback/google)"
if [ "${NEEDS_RELOGIN:-0}" = "1" ]; then
  echo "  3. Sair e logar de novo (ou 'newgrp docker') para o grupo docker valer nesta sessão"
fi
echo
echo "Depois disso: cd $REPO_DIR && ./deploy.sh"
