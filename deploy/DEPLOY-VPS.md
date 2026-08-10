# Deploy do bruno-gusmao + evento-gamificacao numa VPS Hostinger

Os dois projetos rodam na mesma VPS, compartilhando uma única instância de
**Nginx nativo** (instalado via apt, não em container) como reverse proxy
público, e certbot para os certificados. Cada app sobe em containers Docker
próprios, expostos apenas em `127.0.0.1:<porta>` — nunca diretamente na
internet.

Os bancos de dados são **totalmente isolados** e nunca se conectam entre si:

- `bruno-gusmao`: PostgreSQL roda em container Docker próprio (`bruno_postgres`),
  sem porta exposta ao host, numa rede Docker própria (`bruno_internal`,
  subnet `172.29.0.0/24`).
- `evento-gamificacao`: PostgreSQL nativo no host, com role/database dedicados
  (`gamif_prod`/`gamif_evento_prod`) e uma regra `pg_hba.conf` que só libera
  conexões vindas da subnet Docker do próprio app (`172.28.0.0/24`).

Nenhum dos dois containers tem rota de rede para o Postgres do outro app.

## 1. DNS (antes de tudo)

Crie registros **A** apontando para o IP da VPS:

- `brunogusmao.dev`
- `www.brunogusmao.dev`
- `api.brunogusmao.dev`
- `gameficacao.brunogusmao.dev`

Confirme com `dig +short <domínio>`.

## 2. Ordem de bootstrap (uma única vez, VPS nova)

O `vps-setup.sh` do bruno-gusmao instala a infra compartilhada (Docker, Nginx,
certbot, ufw) — rode-o primeiro. O `vps-setup.sh` do evento-gamificacao
reaproveita essa infra e adicionalmente instala o PostgreSQL nativo dele.

```bash
# 1) bruno-gusmao primeiro
ssh sua-vps
git clone <url-do-repo-bruno-gusmao> ~/apps/bruno-gusmao
cd ~/apps/bruno-gusmao
LETSENCRYPT_EMAIL=bruno.mulim.prog@gmail.com ./scripts/vps-setup.sh
# preencher DATABASE_URL (senha) / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / ALLOWED_EMAIL em apps/api/.env
./deploy.sh

# 2) evento-gamificacao
git clone https://github.com/brunophelipegusmao/eventogamificacao.git ~/apps/evento-gamificacao
cd ~/apps/evento-gamificacao
LETSENCRYPT_EMAIL=bruno.mulim.prog@gmail.com ./scripts/vps-setup.sh
# preencher GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / ADMIN_EMAIL(_2) / ADMIN_PASSWORD(_2) em .env.production
./scripts/deploy.sh
```

## 3. Google OAuth

Redirect URIs a cadastrar no Google Console:

- `https://api.brunogusmao.dev/api/auth/callback/google` (bruno-gusmao)
- `https://gameficacao.brunogusmao.dev/api/auth/callback/google` (evento-gamificacao)

## 4. Verificação

```bash
curl -I https://brunogusmao.dev
curl https://api.brunogusmao.dev/api/badges
curl https://api.brunogusmao.dev/api/site-settings
curl -I https://gameficacao.brunogusmao.dev
```

## 5. Atualizações futuras

```bash
cd ~/apps/bruno-gusmao && ./update.sh
cd ~/apps/evento-gamificacao && ./scripts/deploy.sh
```

Não é preciso mexer no Nginx de novo em atualizações de rotina — só quando um
domínio novo entrar na VPS.

## 6. Rollback

```bash
# bruno-gusmao
cd ~/apps/bruno-gusmao && git checkout <sha-anterior> && ./update.sh

# remover um site da VPS sem afetar o outro
sudo rm /etc/nginx/sites-enabled/<domínio>.conf
sudo nginx -t && sudo systemctl reload nginx
docker compose down   # dentro da pasta do app removido
```

## 7. Coordenação entre os dois apps (importante)

- **Subnets Docker devem permanecer distintas**: `172.28.0.0/24` é do
  evento-gamificacao, `172.29.0.0/24` é do bruno-gusmao. Não reaproveite
  nenhuma das duas para outro serviço nesta VPS.
- **Uma única instância de Nginx**: os confs de cada app vivem em
  `/etc/nginx/sites-available/`, cada um no seu arquivo, sem se sobrescrever.
  Mas como só há um `nginx -t`/`reload` para a VPS toda, uma config quebrada
  de um app bloqueia o reload do outro até ser corrigida — isso é esperado,
  não é bug.
- **Portas em loopback usadas**: bruno-gusmao usa `127.0.0.1:3000` (web) e
  `127.0.0.1:3001` (api); evento-gamificacao usa `127.0.0.1:3300`. Nenhuma
  colide.
