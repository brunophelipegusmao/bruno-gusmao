import { createAuthClient } from 'better-auth/react';

// Em produção aponta para o próprio domínio do frontend (brunogusmao.dev),
// pois o Next.js faz rewrite de /api/auth/* para a API interna.
// Em desenvolvimento aponta direto para a API (localhost:3001).
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? 'http://localhost:3001',
});

export const { signIn, signOut, useSession } = authClient;
