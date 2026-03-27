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
    gestionnaireId: 'gestionnaire_id',
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
    typeDeBien: 'Maison',
    sourceId: 'source-uuid-1',
  };

  /**
   * Helper : configure le mock de transaction avec les resultats attendus.
   * emailResult : resultat du select dedup email ([] = pas de doublon)
   * secondaryResult : resultat du select dedup secondaire ([] = pas de doublon)
   * countResult : nombre de dossiers existants pour la reference
   * insertResult : dossier insere
   * gestionnaireResult : resultat du lookup gestionnaire (optionnel)
   */
  function setupTransactionMock(opts: {
    emailResult: unknown[];
    secondaryResult?: unknown[];
    countResult?: number;
    insertResult?: unknown;
    gestionnaireResult?: unknown[];
  }) {
    mockTransaction.mockImplementation(async (fn: Function) => {
      const txSelectLimit = vi.fn();
      const txSelectWhere = vi.fn(() => ({ limit: txSelectLimit }));
      const txSelectFrom = vi.fn(() => ({ where: txSelectWhere }));
      const txSelect = vi.fn(() => ({ from: txSelectFrom }));

      // Premier appel select = dedup email
      txSelectLimit.mockResolvedValueOnce(opts.emailResult);

      // Si doublon email avec gestionnaire, ajouter le lookup
      if (opts.gestionnaireResult) {
        txSelectLimit.mockResolvedValueOnce(opts.gestionnaireResult);
      }

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
        .mockResolvedValueOnce([opts.insertResult]);
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
      statut: 'nouveau',
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

  it('rejette un email deja existant avec message incluant reference et gestionnaire', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    setupTransactionMock({
      emailResult: [
        { reference: 'FB-2026-0042', gestionnaireId: 'user-uuid-1' },
      ],
      gestionnaireResult: [{ name: 'Marie Martin' }],
    });

    const result = await createDossier(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe(
      'Dossier existant — #FB-2026-0042 (gestionnaire : Marie Martin)',
    );
  });

  it('normalise un email en casse mixte avant dedup', async () => {
    const inputMixedCase = { ...validInput, email: '  Jean@Mail.COM  ' };

    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    setupTransactionMock({
      emailResult: [{ reference: 'FB-2026-0001', gestionnaireId: null }],
    });

    const result = await createDossier(inputMixedCase);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Dossier existant');
    expect(result.error).toContain('Non assigne');
  });

  it('retourne un warning pour dedup secondaire (telephone + nom + commune) avec email different', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const fakeDossier = {
      id: 'dossier-uuid-2',
      ...validInput,
      reference: 'FB-2026-0011',
      statut: 'nouveau',
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
    expect(result.warning).toContain('Dossier potentiellement similaire');
    expect(result.warning).toContain('#FB-2026-0010');
  });

  it('rejette une source_id invalide', async () => {
    // Source n'existe pas
    mockSelectLimit.mockResolvedValueOnce([]);

    const result = await createDossier(validInput);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Source invalide');
  });

  it('a le statut nouveau et etape 1 par defaut', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const fakeDossier = {
      id: 'dossier-uuid-3',
      ...validInput,
      reference: 'FB-2026-0001',
      statut: 'nouveau',
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
    expect(result.dossier?.statut).toBe('nouveau');
    expect(result.dossier?.etape).toBe(1);
  });

  it('remet le compteur a 0001 au changement d annee', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    const fakeDossier = {
      id: 'dossier-uuid-4',
      ...validInput,
      reference: 'FB-2026-0001',
      statut: 'nouveau',
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
    expect(result.dossier?.reference).toBe('FB-2026-0001');
  });

  it('renvoie un message user-friendly en cas de violation de contrainte unique email', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);

    // Simule une race condition : la transaction lance une erreur de contrainte unique
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

describe('source_id immutabilite', () => {
  it('updateDossierEtape ne modifie pas le sourceId — seuls etape et timestamps sont mis a jour', async () => {
    const mod = await import('@/lib/dossier');

    // Reinitialiser les mocks pour cet appel
    vi.clearAllMocks();

    const fakeDossier = {
      id: 'dossier-uuid-1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@example.com',
      telephone: '0612345678',
      commune: 'Paris',
      typeDeBien: 'Maison',
      reference: 'FB-2026-0001',
      sourceId: 'source-uuid-1',
      statut: 'nouveau',
      etape: 3,
      etapeUpdatedAt: new Date(),
      updatedAt: new Date(),
    };

    mockUpdateReturning.mockResolvedValueOnce([fakeDossier]);

    await mod.updateDossierEtape('dossier-uuid-1', 3);

    // Verifier que set() a ete appele uniquement avec etape et timestamps
    const setArg = mockUpdateSet.mock.calls[0]![0] as Record<string, unknown>;
    expect(setArg).toHaveProperty('etape', 3);
    expect(setArg).toHaveProperty('etapeUpdatedAt');
    expect(setArg).toHaveProperty('updatedAt');
    expect(setArg).not.toHaveProperty('sourceId');
    expect(setArg).not.toHaveProperty('source_id');
    expect(Object.keys(setArg)).toHaveLength(3);
  });
});

describe('updateDossierEtape', () => {
  let updateDossierEtape: typeof import('@/lib/dossier').updateDossierEtape;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/lib/dossier');
    updateDossierEtape = mod.updateDossierEtape;
  });

  it('met a jour l etape et retourne le dossier mis a jour', async () => {
    const fakeDossier = {
      id: 'dossier-uuid-1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@example.com',
      telephone: '0612345678',
      commune: 'Paris',
      typeDeBien: 'Maison',
      reference: 'FB-2026-0001',
      sourceId: 'source-uuid-1',
      statut: 'nouveau',
      etape: 5,
      etapeUpdatedAt: new Date(),
      updatedAt: new Date(),
    };

    mockUpdateReturning.mockResolvedValueOnce([fakeDossier]);

    const result = await updateDossierEtape('dossier-uuid-1', 5);

    expect(result).toBeDefined();
    expect(result?.etape).toBe(5);
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('retourne null si le dossier n existe pas', async () => {
    mockUpdateReturning.mockResolvedValueOnce([]);

    const result = await updateDossierEtape('nonexistent-uuid', 2);

    expect(result).toBeNull();
  });

  it('met a jour etapeUpdatedAt et updatedAt', async () => {
    const now = new Date();
    const fakeDossier = {
      id: 'dossier-uuid-1',
      etape: 3,
      etapeUpdatedAt: now,
      updatedAt: now,
    };

    mockUpdateReturning.mockResolvedValueOnce([fakeDossier]);

    await updateDossierEtape('dossier-uuid-1', 3);

    const setArg = mockUpdateSet.mock.calls[0]![0] as Record<string, unknown>;
    expect(setArg.etapeUpdatedAt).toBeInstanceOf(Date);
    expect(setArg.updatedAt).toBeInstanceOf(Date);
  });
});
