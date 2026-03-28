import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeEmail } from '@/lib/dossier';

// Mock de la base de donnees
const mockExecute = vi.fn();
const mockInsertReturning = vi.fn();
const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
const mockSelectLimit = vi.fn();
const mockSelectWhere = vi.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));
const mockTransaction = vi.fn();
const mockUpdateReturning = vi.fn();
const mockUpdateWhere = vi.fn(() => ({ returning: mockUpdateReturning }));
const mockUpdateSet = vi.fn((..._args: unknown[]) => ({
  where: mockUpdateWhere,
}));
const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));

vi.mock('@/db', () => {
  return {
    db: new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === 'select') return mockSelect;
          if (prop === 'insert') return mockInsert;
          if (prop === 'transaction') return mockTransaction;
          if (prop === 'execute') return mockExecute;
          if (prop === 'update') return mockUpdate;
          return undefined;
        },
      },
    ),
  };
});

vi.mock('@/db/schema', () => ({
  dossiers: {
    id: 'id',
    email: 'email',
    telephone: 'telephone',
    nom: 'nom',
    commune: 'commune',
    reference: 'reference',
    userId: 'user_id',
    etape: 'etape',
    statut: 'statut',
    createdAt: 'created_at',
  },
  dossierDocuments: {
    id: 'id',
    dossierId: 'dossier_id',
    type: 'type',
    label: 'label',
    received: 'received',
    receivedAt: 'received_at',
  },
  dossierHistory: {
    id: 'id',
    dossierId: 'dossier_id',
    type: 'type',
    content: 'content',
    authorId: 'author_id',
    createdAt: 'created_at',
  },
  sources: { id: 'id', slug: 'slug' },
  users: { id: 'id', name: 'name' },
}));

describe('normalizeEmail', () => {
  it('convertit en lowercase et trim', () => {
    expect(normalizeEmail('  Jean@Mail.COM  ')).toBe('jean@mail.com');
  });

  it('gere un email deja normalise', () => {
    expect(normalizeEmail('test@example.com')).toBe('test@example.com');
  });
});

describe('createDossier', () => {
  let createDossier: typeof import('@/lib/dossier').createDossier;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/lib/dossier');
    createDossier = mod.createDossier;
  });

  const validInput = {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean@example.com',
    telephone: '0612345678',
    commune: 'Paris',
    sourceId: 'source-uuid-1',
  };

  /**
   * Helper : configure le mock de transaction avec les resultats attendus.
   */
  function setupTransactionMock(opts: {
    emailResult: unknown[];
    secondaryResult?: unknown[];
    countResult?: number;
    insertResult?: unknown;
  }) {
    mockTransaction.mockImplementation(async (fn: Function) => {
      const txSelectLimit = vi.fn();
      const txSelectWhere = vi.fn(() => ({ limit: txSelectLimit }));
      const txSelectFrom = vi.fn(() => ({ where: txSelectWhere }));
      const txSelect = vi.fn(() => ({ from: txSelectFrom }));

      // Premier appel select = dedup email
      txSelectLimit.mockResolvedValueOnce(opts.emailResult);

      // Deuxieme appel select = dedup secondaire
      if (opts.secondaryResult !== undefined) {
        txSelectLimit.mockResolvedValueOnce(opts.secondaryResult);
      }

      const txExecute = vi.fn();
      // Advisory lock
      txExecute.mockResolvedValueOnce([]);
      // Count pour reference
      if (opts.countResult !== undefined) {
        txExecute.mockResolvedValueOnce([{ count: opts.countResult }]);
      }

      const txInsertReturning = vi
        .fn()
        .mockResolvedValueOnce([opts.insertResult])
        // Documents par defaut
        .mockResolvedValueOnce([])
        // Entree historique creation
        .mockResolvedValueOnce([]);
      const txInsertValues = vi.fn(() => ({
        returning: txInsertReturning,
      }));
      const txInsert = vi.fn(() => ({ values: txInsertValues }));

      const tx = {
        select: txSelect,
        execute: txExecute,
        insert: txInsert,
      };
      return fn(tx);
    });
  }

  it('cree un dossier avec tous les champs valides et reference FB-2026-0001', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const fakeDossier = {
      id: 'dossier-uuid-1',
      ...validInput,
      email: 'jean@example.com',
      reference: 'FB-2026-0001',
      statut: 'actif',
      etape: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setupTransactionMock({
      emailResult: [],
      secondaryResult: [],
      countResult: 0,
      insertResult: fakeDossier,
    });

    const result = await createDossier(validInput);

    expect(result.success).toBe(true);
    expect(result.dossier).toBeDefined();
    expect(result.dossier?.reference).toBe('FB-2026-0001');
    expect(result.error).toBeUndefined();
  });

  it('rejette un email deja existant', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    setupTransactionMock({
      emailResult: [{ reference: 'FB-2026-0042' }],
    });

    const result = await createDossier(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain('existe deja');
  });

  it('retourne un warning pour dedup secondaire', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const fakeDossier = {
      id: 'dossier-uuid-2',
      ...validInput,
      reference: 'FB-2026-0011',
      statut: 'actif',
      etape: 1,
    };

    setupTransactionMock({
      emailResult: [],
      secondaryResult: [{ reference: 'FB-2026-0010' }],
      countResult: 10,
      insertResult: fakeDossier,
    });

    const result = await createDossier(validInput);

    expect(result.success).toBe(true);
    expect(result.warning).toContain('potentiellement similaire');
    expect(result.warning).toContain('#FB-2026-0010');
  });

  it('rejette une source_id invalide', async () => {
    // Source n'existe pas
    mockSelectLimit.mockResolvedValueOnce([]);

    const result = await createDossier(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Source invalide');
  });

  it('a le statut actif et etape 1 par defaut', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const fakeDossier = {
      id: 'dossier-uuid-3',
      ...validInput,
      reference: 'FB-2026-0001',
      statut: 'actif',
      etape: 1,
    };

    setupTransactionMock({
      emailResult: [],
      secondaryResult: [],
      countResult: 0,
      insertResult: fakeDossier,
    });

    const result = await createDossier(validInput);

    expect(result.success).toBe(true);
    expect(result.dossier?.statut).toBe('actif');
    expect(result.dossier?.etape).toBe(1);
  });

  it('renvoie un message user-friendly en cas de violation de contrainte unique email', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const dbError = new Error(
      'duplicate key value violates unique constraint "dossiers_email_unique"',
    );
    (dbError as unknown as { code: string }).code = '23505';
    mockTransaction.mockRejectedValueOnce(dbError);

    const result = await createDossier(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Un dossier avec cet email existe deja.');
  });

  it('propage les erreurs non liees a la contrainte email', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    mockTransaction.mockRejectedValueOnce(new Error('connection lost'));

    await expect(createDossier(validInput)).rejects.toThrow('connection lost');
  });
});
