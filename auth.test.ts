import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// On ne peut pas importer auth.ts directement car il initialise NextAuth.
// On teste validateAuthEnv en isolation via un import dynamique partiel.

describe('validateAuthEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // Importe validateAuthEnv en mockant les dépendances lourdes
  async function loadValidateAuthEnv() {
    vi.doMock('next-auth', () => ({
      default: vi.fn(() => ({
        handlers: {},
        auth: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
      })),
    }));
    vi.doMock('next-auth/providers/credentials', () => ({
      default: vi.fn(() => ({})),
    }));
    vi.doMock('next-auth/providers/google', () => ({
      default: vi.fn(() => ({})),
    }));
    vi.doMock('@auth/drizzle-adapter', () => ({
      DrizzleAdapter: vi.fn(() => ({})),
    }));
    vi.doMock('bcryptjs', () => ({
      default: { compare: vi.fn(), hash: vi.fn() },
    }));
    vi.doMock('@/db', () => ({
      db: { query: { users: { findFirst: vi.fn() } } },
    }));
    vi.doMock('@/db/schema', () => ({
      users: {},
      accounts: {},
      sessions: {},
      verificationTokens: {},
    }));
    vi.doMock('./auth.config', () => ({
      authConfig: { pages: {}, callbacks: {}, providers: [] },
    }));

    const mod = await import('./auth');
    return mod.validateAuthEnv;
  }

  it('retourne les variables requises manquantes quand AUTH_SECRET absent', async () => {
    delete process.env.AUTH_SECRET;
    process.env.AUTH_GOOGLE_ID = 'google-id';
    process.env.AUTH_GOOGLE_SECRET = 'google-secret';

    const validateAuthEnv = await loadValidateAuthEnv();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = validateAuthEnv();

    expect(result.missingRequired).toContain('AUTH_SECRET');
    expect(result.missingOptional).toHaveLength(0);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('AUTH_SECRET'),
    );
    consoleError.mockRestore();
  });

  it('retourne les variables OAuth manquantes', async () => {
    process.env.AUTH_SECRET = 'secret';
    delete process.env.AUTH_GOOGLE_ID;
    delete process.env.AUTH_GOOGLE_SECRET;

    const validateAuthEnv = await loadValidateAuthEnv();
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = validateAuthEnv();

    expect(result.missingRequired).toHaveLength(0);
    expect(result.missingOptional).toContain('AUTH_GOOGLE_ID');
    expect(result.missingOptional).toContain('AUTH_GOOGLE_SECRET');
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Google sera désactivée'),
    );
    consoleWarn.mockRestore();
  });

  it('ne retourne rien quand toutes les variables sont présentes', async () => {
    process.env.AUTH_SECRET = 'secret';
    process.env.AUTH_GOOGLE_ID = 'google-id';
    process.env.AUTH_GOOGLE_SECRET = 'google-secret';

    const validateAuthEnv = await loadValidateAuthEnv();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = validateAuthEnv();

    expect(result.missingRequired).toHaveLength(0);
    expect(result.missingOptional).toHaveLength(0);
    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });
});
