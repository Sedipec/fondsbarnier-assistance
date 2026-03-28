import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcryptjs from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users, accounts, sessions, verificationTokens } from '@/db/schema';
import { authConfig } from './auth.config';

// Validation runtime des variables d'environnement auth
function validateAuthEnv() {
  const required: Record<string, string | undefined> = {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(
      `[auth] Variables d'environnement manquantes : ${missing.join(', ')}. ` +
        `L'authentification ne fonctionnera pas correctement.`,
    );
  }
}

validateAuthEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const isValid = await bcryptjs.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }

      // Fallback: fetch role from DB if missing (ex: first Google OAuth login)
      if (!token.role && token.id) {
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, token.id as string),
        });
        if (dbUser) token.role = dbUser.role;
      }

      // Mettre a jour le token si la session est mise a jour
      if (trigger === 'update' && session) {
        token.role = session.role;
      }

      return token;
    },
    async signIn({ user, account }) {
      // Pour les connexions OAuth, verifier si le compte est actif
      if (account?.provider !== 'credentials') {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, user.email!),
        });
        if (existingUser && !existingUser.isActive) {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Les utilisateurs crees via OAuth ont le role client par defaut
      // Ce callback est declenche par l'adapter Drizzle
      if (user.id) {
        await db
          .update(users)
          .set({ role: 'client' })
          .where(eq(users.id, user.id));
      }
    },
  },
});
