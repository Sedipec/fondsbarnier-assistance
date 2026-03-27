import type { NextAuthConfig } from 'next-auth';

// Configuration partagee entre middleware et auth complet
export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        const role = (auth?.user as { role?: string })?.role;
        if (role !== 'admin') {
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
        return true;
      }

      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        return true;
      }

      // Rediriger les utilisateurs connectes depuis les pages auth
      if (isOnAuth && isLoggedIn) {
        const role = (auth?.user as { role?: string })?.role;
        const redirectUrl = role === 'admin' ? '/admin' : '/dashboard';
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
