import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks des dependances externes
const mockEnd = vi.fn();
const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));
const mockValues = vi.fn();
const mockInsert = vi.fn(() => ({ values: mockValues }));
const mockDb = {
  select: mockSelect,
  insert: mockInsert,
};

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: vi.fn(() => mockDb),
}));

vi.mock('postgres', () => ({
  default: vi.fn(() => ({ end: mockEnd })),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

vi.mock('./schema', () => ({
  users: { email: 'email' },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
}));

describe('seedAdmin', () => {
  const originalEnv = process.env;
  const mockExit = vi
    .spyOn(process, 'exit')
    .mockImplementation(() => undefined as never);
  const mockConsoleError = vi
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const mockConsoleLog = vi
    .spyOn(console, 'log')
    .mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, NODE_ENV: 'test' };
  });

  async function importAndRun() {
    // Re-import a chaque test pour reset l'etat du module
    const { seedAdmin } = await import('./seed-admin');
    return seedAdmin();
  }

  describe('validation des variables d\'environnement', () => {
    it('doit echouer si DATABASE_URL est manquant', async () => {
      delete process.env.DATABASE_URL;
      delete process.env.ADMIN_EMAIL;
      delete process.env.ADMIN_PASSWORD;
      delete process.env.ADMIN_NAME;

      await importAndRun();

      expect(mockConsoleError).toHaveBeenCalledWith('DATABASE_URL est requis');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('doit echouer si ADMIN_EMAIL est manquant', async () => {
      process.env.DATABASE_URL = 'postgres://localhost/test';
      delete process.env.ADMIN_EMAIL;
      delete process.env.ADMIN_PASSWORD;
      delete process.env.ADMIN_NAME;

      await importAndRun();

      expect(mockConsoleError).toHaveBeenCalledWith('ADMIN_EMAIL est requis');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('doit echouer si ADMIN_PASSWORD est manquant', async () => {
      process.env.DATABASE_URL = 'postgres://localhost/test';
      process.env.ADMIN_EMAIL = 'admin@test.com';
      delete process.env.ADMIN_PASSWORD;
      delete process.env.ADMIN_NAME;

      await importAndRun();

      expect(mockConsoleError).toHaveBeenCalledWith(
        'ADMIN_PASSWORD est requis',
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('doit echouer si ADMIN_NAME est manquant', async () => {
      process.env.DATABASE_URL = 'postgres://localhost/test';
      process.env.ADMIN_EMAIL = 'admin@test.com';
      process.env.ADMIN_PASSWORD = 'password123';
      delete process.env.ADMIN_NAME;

      await importAndRun();

      expect(mockConsoleError).toHaveBeenCalledWith('ADMIN_NAME est requis');
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('idempotence', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = 'postgres://localhost/test';
      process.env.ADMIN_EMAIL = 'admin@test.com';
      process.env.ADMIN_PASSWORD = 'password123';
      process.env.ADMIN_NAME = 'Admin';
    });

    it('ne doit pas inserer si l\'utilisateur existe deja', async () => {
      mockLimit.mockResolvedValueOnce([{ id: 1, email: 'admin@test.com' }]);

      await importAndRun();

      expect(mockSelect).toHaveBeenCalled();
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Utilisateur admin "admin@test.com" existe deja, aucune action requise.',
      );
      expect(mockEnd).toHaveBeenCalled();
    });

    it('doit inserer un nouvel admin si l\'utilisateur n\'existe pas', async () => {
      mockLimit.mockResolvedValueOnce([]);

      await importAndRun();

      expect(mockInsert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalledWith({
        name: 'Admin',
        email: 'admin@test.com',
        password: 'hashed_password',
        role: 'admin',
      });
      expect(mockConsoleLog).toHaveBeenCalledWith(
        'Utilisateur admin "Admin" (admin@test.com) cree avec succes.',
      );
      expect(mockEnd).toHaveBeenCalled();
    });
  });
});
