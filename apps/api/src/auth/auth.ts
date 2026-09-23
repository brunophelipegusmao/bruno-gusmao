import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/client';
import { account, session, user, verification } from '../db/schema';

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (process.env.WEB_URL ?? 'http://localhost:3000').split(','),

  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),

  emailAndPassword: {
    // Login por email/senha só fica disponível fora de produção — em produção
    // o login continua exclusivamente via Google, sem alteração de comportamento.
    enabled: process.env.NODE_ENV !== 'production',
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const allowedEmails = (process.env.ALLOWED_EMAIL ?? '')
            .split(',')
            .map((email) => email.toLowerCase().trim())
            .filter(Boolean);
          const incomingEmail = newUser.email?.toLowerCase().trim();

          console.log('[Auth] create.before → incoming:', incomingEmail, '| allowed:', allowedEmails);

          if (allowedEmails.length === 0) {
            throw new Error('ALLOWED_EMAIL não configurado.');
          }

          if (!incomingEmail || !allowedEmails.includes(incomingEmail)) {
            throw new Error('Acesso negado.');
          }
        },
      },
    },
  },
});
