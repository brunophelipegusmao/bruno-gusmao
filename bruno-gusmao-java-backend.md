---
name: bruno-gusmao-java-backend
description: bruno-gusmao em produção roda backend Java (Spring), não NestJS; repo movido para brunogusmaodev
metadata:
  type: project
---
Desde 2026-09-23 o bruno-gusmao (/root/apps/bruno-gusmao) roda só o backend Java (apps/api-java, Spring Boot, Dockerfile.api-java) no container bruno_api:3001. O usuário não quer o NestJS (apps/api) rodando.
Repo: git@github.com:brunogusmaodev/bruno-gusmao.git (antes brunophelipegusmao). Banco do Java: bruno_gusmao_java (começou vazio por escolha do usuário); o banco antigo do Nest (bruno_gusmao) segue no mesmo volume como backup.

**Why:** migração de backend decidida pelo usuário.
**How to apply:** deploys via ./deploy.sh / ./update.sh (Flyway migra no boot); nunca subir o Nest.
