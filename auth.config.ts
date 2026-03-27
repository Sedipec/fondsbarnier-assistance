import type { NextAuthConfig } from 'next-auth';

// Configuration partagee entre middleware et auth complet
export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnEspace = nextUrl.pathname.startsWith('/espace');
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');
      const role = (auth?.user as { role?: string })?.role;

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        if (role !== 'admin') {
          return Response.redirect(new URL('/espace/mon-dossier', nextUrl));
        }
        // Rediriger /admin vers /admin/dashboard
        if (nextUrl.pathname === '/admin') {
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }

      if (isOnEspace) {
        if (!isLoggedIn) return false;
        if (role === 'admin') {
          return Response.redirect(new URL('/admin/dashboard', nextUrl));
        }
        return true;
      }

      // Rediriger l'ancien /dashboard vers les nouvelles routes
      if (isOnDashboard) {
        if (!isLoggedIn) return false;
        const redirectUrl =
          role === 'admin' ? '/admin/dashboard' : '/espace/mon-dossier';
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      // Rediriger les utilisateurs connectes depuis les pages auth
      if (isOnAuth && isLoggedIn) {
        const redirectUrl =
          role === 'admin' ? '/admin/dashboard' : '/espace/mon-dossier';
        return Response.redirect(new URL(redirectUrl, nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
