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
    enabled: true,
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
          const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase().trim();
          const incomingEmail = newUser.email?.toLowerCase().trim();

          console.log('[Auth] create.before → incoming:', incomingEmail, '| allowed:', allowedEmail);

          if (!allowedEmail) {
            throw new Error('ALLOWED_EMAIL não configurado.');
          }

          if (incomingEmail !== allowedEmail) {
            throw new Error('Acesso negado.');
          }
        },
      },
    },
  },
});
