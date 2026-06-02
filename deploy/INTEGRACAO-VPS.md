# Integração do bruno-gusmao na VPS (coexistindo com management-process-web)

O outro sistema (`management-process-web`) é 100% Docker e seu **container nginx é dono das portas 80/443**. O bruno-gusmao sobe em containers próprios e é **servido através do nginx que já existe** — de forma 100% aditiva, sem editar o `docker-compose.yml` nem o site do outro sistema.

- bruno-gusmao: `bruno_postgres`, `bruno_api` (3001), `bruno_web` (3000) — em containers.
- `bruno_api`/`bruno_web` entram na **mesma rede Docker** do outro sistema → o nginx dele os alcança por nome.
- Integração no nginx = **2 arquivos novos em `conf.d/`** + certificado + `nginx -s reload` (zero downtime).

Convenções abaixo:
- `BRUNO_DIR` = pasta do bruno-gusmao (ex: `~/bruno-gusmao`)
- `OUTRO_DIR` = pasta do management-process-web (onde está o `docker-compose.yml` dele)

---

## 1. DNS (antes de tudo)

Crie 3 registros **A** apontando para o IP da VPS: `brunogusmao.dev`, `www.brunogusmao.dev`, `api.brunogusmao.dev`.
Confirme: `dig +short brunogusmao.dev` deve retornar o IP.

## 2. Descobrir o nome da rede Docker compartilhada

```bash
docker network ls | grep internal
```
Anote o nome (provavelmente `management-process-web_internal`). Se for diferente, na pasta do bruno crie um `.env`:
```bash
cd BRUNO_DIR
echo "SHARED_NETWORK=<nome-da-rede>" > .env
```

## 3. Configurar o `.env` da API

```bash
cd BRUNO_DIR
cp apps/api/.env.production apps/api/.env
# já vem pronto; o host do banco é o container bruno_postgres
```

## 4. Subir os containers do bruno-gusmao

```bash
cd BRUNO_DIR
./deploy.sh
```
Ao final, `docker compose ps` deve mostrar `bruno_postgres`, `bruno_api`, `bruno_web` saudáveis.
Teste interno (a partir do nginx do outro sistema):
```bash
cd OUTRO_DIR
docker compose exec nginx wget -qO- http://bruno_web:3000/ >/dev/null && echo "nginx alcança bruno_web ✓"
```

## 5. Integrar ao nginx do outro sistema — ORDEM IMPORTA

> ⚠️ O `brunogusmao-https.conf` referencia certificados que **ainda não existem**.
> Adicione primeiro só o `-http.conf`, emita o certificado, e **só então** o `-https.conf`.
> Se o `-https.conf` entrar antes do certificado, o `nginx -t` falha.

### 5a. Copiar o conf HTTP (porta 80 + ACME) e recarregar

```bash
cp BRUNO_DIR/deploy/nginx-other-system/brunogusmao-http.conf OUTRO_DIR/nginx/conf.d/
cd OUTRO_DIR
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

### 5b. Emitir o certificado (certbot do outro sistema, método webroot)

```bash
cd OUTRO_DIR
docker compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d brunogusmao.dev -d www.brunogusmao.dev -d api.brunogusmao.dev \
  --email bruno.mulim.prog@gmail.com --agree-tos --no-eff-email
```

### 5c. Copiar o conf HTTPS e recarregar

```bash
cp BRUNO_DIR/deploy/nginx-other-system/brunogusmao-https.conf OUTRO_DIR/nginx/conf.d/
cd OUTRO_DIR
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```

> Se `nginx -t` falhar em qualquer passo, **não** recarregue — o site do outro sistema
> continua intacto com a config anterior. Corrija e teste de novo.

## 6. Google OAuth

No Google Console, adicione a redirect URI:
`https://api.brunogusmao.dev/api/auth/callback/google`

## 7. Verificação

```bash
curl -I https://brunogusmao.dev
curl https://api.brunogusmao.dev/api/badges
curl https://brunogusmao.dev/sitemap.xml
curl https://brunogusmao.dev/robots.txt
# o outro sistema continua no ar:
curl -I https://mulimassociados.adv.br
```
No navegador: DevTools → Application → Manifest e Service Worker. Login em `/login`.

---

## Atualizações futuras

```bash
cd BRUNO_DIR && ./update.sh
```
Não precisa mexer no nginx de novo (os confs ficam no `conf.d/` do outro sistema).

## Renovação dos certificados

Os certificados ficam no volume compartilhado `/etc/letsencrypt`. A renovação que o outro
sistema já faz (`certbot renew`) renova os do bruno-gusmao junto. Após renovar, recarregue:
```bash
cd OUTRO_DIR && docker compose exec nginx nginx -s reload
```

## Rollback (remover o bruno-gusmao sem afetar o outro sistema)

```bash
rm OUTRO_DIR/nginx/conf.d/brunogusmao-http.conf OUTRO_DIR/nginx/conf.d/brunogusmao-https.conf
cd OUTRO_DIR && docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
cd BRUNO_DIR && docker compose down
```
