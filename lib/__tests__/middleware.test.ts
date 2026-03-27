import { describe, it, expect } from 'vitest';

// Simuler la logique du middleware authorized callback
interface MockAuth {
  user?: {
    role?: string;
  };
}

function authorizedCallback(
  auth: MockAuth | null,
  pathname: string,
): { authorized: boolean; redirect?: string } {
  const isLoggedIn = !!auth?.user;
  const isOnDashboard = pathname.startsWith('/dashboard');
  const isOnAdmin = pathname.startsWith('/admin');
  const isOnAuth = pathname.startsWith('/auth');

  if (isOnAdmin) {
    if (!isLoggedIn) return { authorized: false, redirect: '/auth/login' };
    if (auth?.user?.role !== 'admin')
      return { authorized: false, redirect: '/dashboard' };
    return { authorized: true };
  }

  if (isOnDashboard) {
    if (!isLoggedIn) return { authorized: false, redirect: '/auth/login' };
    return { authorized: true };
  }

  if (isOnAuth && isLoggedIn) {
    const redirect = auth?.user?.role === 'admin' ? '/admin' : '/dashboard';
    return { authorized: false, redirect };
  }

  return { authorized: true };
}

describe('Middleware - Protection des routes', () => {
  it('redirige vers /auth/login si non connecte et accede a /dashboard', () => {
    const result = authorizedCallback(null, '/dashboard');
    expect(result.authorized).toBe(false);
    expect(result.redirect).toBe('/auth/login');
  });

  it('redirige vers /auth/login si non connecte et accede a /admin', () => {
    const result = authorizedCallback(null, '/admin');
    expect(result.authorized).toBe(false);
    expect(result.redirect).toBe('/auth/login');
  });

  it('redirige vers /dashboard si client accede a /admin', () => {
    const result = authorizedCallback({ user: { role: 'client' } }, '/admin');
    expect(result.authorized).toBe(false);
    expect(result.redirect).toBe('/dashboard');
  });

  it('autorise un admin a acceder a /admin', () => {
    const result = authorizedCallback({ user: { role: 'admin' } }, '/admin');
    expect(result.authorized).toBe(true);
  });

  it('autorise un client connecte a acceder a /dashboard', () => {
    const result = authorizedCallback(
      { user: { role: 'client' } },
      '/dashboard',
    );
    expect(result.authorized).toBe(true);
  });

  it('redirige un client connecte depuis /auth/login vers /dashboard', () => {
    const result = authorizedCallback(
      { user: { role: 'client' } },
      '/auth/login',
    );
    expect(result.authorized).toBe(false);
    expect(result.redirect).toBe('/dashboard');
  });

  it('redirige un admin connecte depuis /auth/login vers /admin', () => {
    const result = authorizedCallback(
      { user: { role: 'admin' } },
      '/auth/login',
    );
    expect(result.authorized).toBe(false);
    expect(result.redirect).toBe('/admin');
  });

  it('autorise l acces aux pages publiques', () => {
    const result = authorizedCallback(null, '/');
    expect(result.authorized).toBe(true);
  });

  it('autorise l acces a /about sans connexion', () => {
    const result = authorizedCallback(null, '/about');
    expect(result.authorized).toBe(true);
  });
});
