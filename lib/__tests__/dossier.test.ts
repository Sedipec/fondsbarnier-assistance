import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeEmail } from '@/lib/dossier';

// Mock de la base de donnees
const mockExecute = vi.fn();
const mockInsertReturning = vi.fn();
const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
const mockSelectOffset = vi.fn();
const mockSelectOrderByLimit = vi.fn(() => ({ offset: mockSelectOffset }));
const mockSelectOrderBy = vi.fn(() => ({
  limit: mockSelectOrderByLimit,
  offset: mockSelectOffset,
}));
const mockSelectLimit = vi.fn();
const mockSelectWhere = vi.fn(() => ({
  limit: mockSelectLimit,
  orderBy: mockSelectOrderBy,
}));
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

/**
 * Reapplique les implementations par defaut des mocks apres un reset.
 * Necesaire car vi.resetAllMocks() efface les implementations inline de vi.fn(() => ...).
 */
function restoreDefaultMockImplementations() {
  mockInsertValues.mockImplementation(() => ({ returning: mockInsertReturning }));
  mockInsert.mockImplementation(() => ({ values: mockInsertValues }));
  mockSelectOffset.mockImplementation(() => undefined);
  mockSelectOrderByLimit.mockImplementation(() => ({ offset: mockSelectOffset }));
  mockSelectOrderBy.mockImplementation(() => ({
    limit: mockSelectOrderByLimit,
    offset: mockSelectOffset,
  }));
  mockSelectWhere.mockImplementation(() => ({
    limit: mockSelectLimit,
    orderBy: mockSelectOrderBy,
  }));
  mockSelectFrom.mockImplementation(() => ({ where: mockSelectWhere }));
  mockSelect.mockImplementation(() => ({ from: mockSelectFrom }));
  mockUpdateWhere.mockImplementation(() => ({ returning: mockUpdateReturning }));
  mockUpdateSet.mockImplementation((..._args: unknown[]) => ({ where: mockUpdateWhere }));
  mockUpdate.mockImplementation(() => ({ set: mockUpdateSet }));
}

describe('getDossierById', () => {
  let getDossierById: typeof import('@/lib/dossier').getDossierById;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    getDossierById = mod.getDossierById;
  });

  const fakeDossier = {
    id: 'dossier-uuid-1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean@example.com',
    reference: 'FB-2026-0001',
    statut: 'actif',
    etape: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('retourne null si le dossier n\'existe pas', async () => {
    // Premier select : dossier non trouve
    mockSelectLimit.mockResolvedValueOnce([]);

    const result = await getDossierById('dossier-inconnu');

    expect(result).toBeNull();
  });

  it('retourne le dossier avec ses documents et son historique', async () => {
    const fakeDocuments = [
      { id: 'doc-1', dossierId: 'dossier-uuid-1', type: 'assurance', label: 'Attestation', received: false },
    ];
    const fakeHistory = [
      { id: 'hist-1', dossierId: 'dossier-uuid-1', type: 'creation', content: 'Dossier cree', authorId: null, createdAt: new Date() },
    ];

    vi.clearAllMocks();

    // Select 1 : dossier
    const mockLimit1 = vi.fn().mockResolvedValueOnce([fakeDossier]);
    // Select 2 : documents (pas de limit ni orderBy - c'est la valeur resolue de where)
    const mockDocWhere = vi.fn().mockResolvedValueOnce(fakeDocuments);
    // Select 3 : historique avec orderBy
    const mockHistOrderBy = vi.fn().mockResolvedValueOnce(fakeHistory);
    const mockHistWhere = vi.fn(() => ({
      limit: vi.fn(),
      orderBy: mockHistOrderBy,
    }));

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // select dossier
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: mockLimit1, orderBy: vi.fn() })),
          })),
        };
      } else if (selectCallCount === 2) {
        // select documents
        return {
          from: vi.fn(() => ({
            where: mockDocWhere,
          })),
        };
      } else {
        // select historique
        return {
          from: vi.fn(() => ({
            where: mockHistWhere,
          })),
        };
      }
    });

    const result = await getDossierById('dossier-uuid-1');

    expect(result).not.toBeNull();
    expect(result?.documents).toEqual(fakeDocuments);
    expect(result?.history).toEqual(fakeHistory);
  });
});

describe('getDossierByUserId', () => {
  let getDossierByUserId: typeof import('@/lib/dossier').getDossierByUserId;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    getDossierByUserId = mod.getDossierByUserId;
  });

  it('retourne null si aucun dossier n\'est lie a cet userId', async () => {
    // Select par userId : non trouve
    mockSelectLimit.mockResolvedValueOnce([]);

    const result = await getDossierByUserId('user-inconnu');

    expect(result).toBeNull();
  });

  it('retourne le dossier complet si userId correspond', async () => {
    const fakeDossier = {
      id: 'dossier-uuid-1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean@example.com',
      reference: 'FB-2026-0001',
      statut: 'actif',
      etape: 1,
      userId: 'user-uuid-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const fakeDocuments = [{ id: 'doc-1', dossierId: 'dossier-uuid-1' }];
    const fakeHistory = [{ id: 'hist-1', dossierId: 'dossier-uuid-1' }];

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Select par userId
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({ limit: vi.fn().mockResolvedValueOnce([fakeDossier]) })),
          })),
        };
      } else if (selectCallCount === 2) {
        // getDossierById : select dossier par id
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn().mockResolvedValueOnce([fakeDossier]),
              orderBy: vi.fn(),
            })),
          })),
        };
      } else if (selectCallCount === 3) {
        // getDossierById : select documents
        return {
          from: vi.fn(() => ({
            where: vi.fn().mockResolvedValueOnce(fakeDocuments),
          })),
        };
      } else {
        // getDossierById : select historique
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn().mockResolvedValueOnce(fakeHistory),
            })),
          })),
        };
      }
    });

    const result = await getDossierByUserId('user-uuid-1');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('dossier-uuid-1');
    expect(result?.documents).toEqual(fakeDocuments);
    expect(result?.history).toEqual(fakeHistory);
  });
});

describe('listDossiers', () => {
  let listDossiers: typeof import('@/lib/dossier').listDossiers;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    listDossiers = mod.listDossiers;
  });

  it('retourne la liste et le total sans filtres', async () => {
    const fakeData = [
      { id: 'dossier-1', nom: 'Dupont', reference: 'FB-2026-0001' },
      { id: 'dossier-2', nom: 'Martin', reference: 'FB-2026-0002' },
    ];

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        // Select count
        return {
          from: vi.fn(() => ({
            where: vi.fn().mockResolvedValueOnce([{ value: 2 }]),
          })),
        };
      } else {
        // Select data avec orderBy/limit/offset
        const mockOffset2 = vi.fn().mockResolvedValueOnce(fakeData);
        const mockLimit2 = vi.fn(() => ({ offset: mockOffset2 }));
        const mockOrderBy2 = vi.fn(() => ({ limit: mockLimit2 }));
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: mockOrderBy2,
            })),
          })),
        };
      }
    });

    const result = await listDossiers({});

    expect(result.count).toBe(2);
    expect(result.data).toEqual(fakeData);
  });

  it('respecte la pagination (page, limit)', async () => {
    const fakeData = [{ id: 'dossier-3', nom: 'Leblanc', reference: 'FB-2026-0003' }];

    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        return {
          from: vi.fn(() => ({
            where: vi.fn().mockResolvedValueOnce([{ value: 15 }]),
          })),
        };
      } else {
        const mockOffset2 = vi.fn().mockResolvedValueOnce(fakeData);
        const mockLimit2 = vi.fn(() => ({ offset: mockOffset2 }));
        const mockOrderBy2 = vi.fn(() => ({ limit: mockLimit2 }));
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: mockOrderBy2,
            })),
          })),
        };
      }
    });

    const result = await listDossiers({ page: 2, limit: 5 });

    expect(result.count).toBe(15);
    expect(result.data).toEqual(fakeData);
  });

  it('retourne count 0 et data vide si aucun resultat', async () => {
    let selectCallCount = 0;
    mockSelect.mockImplementation(() => {
      selectCallCount++;
      if (selectCallCount === 1) {
        return {
          from: vi.fn(() => ({
            where: vi.fn().mockResolvedValueOnce([]),
          })),
        };
      } else {
        const mockOffset2 = vi.fn().mockResolvedValueOnce([]);
        const mockLimit2 = vi.fn(() => ({ offset: mockOffset2 }));
        const mockOrderBy2 = vi.fn(() => ({ limit: mockLimit2 }));
        return {
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: mockOrderBy2,
            })),
          })),
        };
      }
    });

    const result = await listDossiers({ statut: 'clos' });

    expect(result.count).toBe(0);
    expect(result.data).toEqual([]);
  });
});

describe('updateDossier', () => {
  let updateDossier: typeof import('@/lib/dossier').updateDossier;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    updateDossier = mod.updateDossier;
  });

  it('retourne le dossier mis a jour', async () => {
    const updatedDossier = {
      id: 'dossier-uuid-1',
      nom: 'Durand',
      prenom: 'Jean',
      email: 'jean@example.com',
      statut: 'actif',
      etape: 1,
    };
    mockUpdateReturning.mockResolvedValueOnce([updatedDossier]);

    const result = await updateDossier('dossier-uuid-1', { nom: 'Durand' });

    expect(result).toEqual(updatedDossier);
    expect(mockUpdate).toHaveBeenCalledWith(expect.anything());
    expect(mockUpdateSet).toHaveBeenCalled();
  });

  it('retourne null si le dossier n\'existe pas', async () => {
    mockUpdateReturning.mockResolvedValueOnce([]);

    const result = await updateDossier('dossier-inconnu', { nom: 'Durand' });

    expect(result).toBeNull();
  });

  it('met a jour le statut', async () => {
    const updatedDossier = { id: 'dossier-uuid-1', statut: 'suspendu' };
    mockUpdateReturning.mockResolvedValueOnce([updatedDossier]);

    const result = await updateDossier('dossier-uuid-1', { statut: 'suspendu' });

    expect(result?.statut).toBe('suspendu');
  });
});

describe('advanceEtape', () => {
  let advanceEtape: typeof import('@/lib/dossier').advanceEtape;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    advanceEtape = mod.advanceEtape;
  });

  it('leve une erreur si l\'etape est invalide (< 1)', async () => {
    await expect(advanceEtape('dossier-uuid-1', 0, 'author-1')).rejects.toThrow(
      'Etape invalide',
    );
  });

  it('leve une erreur si l\'etape est invalide (> 10)', async () => {
    await expect(advanceEtape('dossier-uuid-1', 11, 'author-1')).rejects.toThrow(
      'Etape invalide',
    );
  });

  it('retourne null si le dossier n\'existe pas dans la transaction', async () => {
    mockTransaction.mockImplementation(async (fn: Function) => {
      const txSelectLimit = vi.fn().mockResolvedValueOnce([]);
      const txSelectWhere = vi.fn(() => ({ limit: txSelectLimit, orderBy: vi.fn() }));
      const txSelectFrom = vi.fn(() => ({ where: txSelectWhere }));
      const txSelect = vi.fn(() => ({ from: txSelectFrom }));
      const tx = { select: txSelect, update: vi.fn(), insert: vi.fn() };
      return fn(tx);
    });

    const result = await advanceEtape('dossier-inconnu', 3, 'author-1');

    expect(result).toBeNull();
  });

  it('avance l\'etape et insere une entree historique', async () => {
    const fakeDossier = { etape: 2, reference: 'FB-2026-0001' };
    const updatedDossier = { id: 'dossier-uuid-1', etape: 3, reference: 'FB-2026-0001' };

    mockTransaction.mockImplementation(async (fn: Function) => {
      const txSelectLimit = vi.fn().mockResolvedValueOnce([fakeDossier]);
      const txSelectWhere = vi.fn(() => ({ limit: txSelectLimit, orderBy: vi.fn() }));
      const txSelectFrom = vi.fn(() => ({ where: txSelectWhere }));
      const txSelect = vi.fn(() => ({ from: txSelectFrom }));

      const txUpdateReturning = vi.fn().mockResolvedValueOnce([updatedDossier]);
      const txUpdateWhere = vi.fn(() => ({ returning: txUpdateReturning }));
      const txUpdateSet = vi.fn(() => ({ where: txUpdateWhere }));
      const txUpdate = vi.fn(() => ({ set: txUpdateSet }));

      const txInsertReturning = vi.fn().mockResolvedValueOnce([]);
      const txInsertValues = vi.fn(() => ({ returning: txInsertReturning }));
      const txInsert = vi.fn(() => ({ values: txInsertValues }));

      const tx = { select: txSelect, update: txUpdate, insert: txInsert };
      return fn(tx);
    });

    const result = await advanceEtape('dossier-uuid-1', 3, 'author-1');

    expect(result).toEqual(updatedDossier);
    expect(result?.etape).toBe(3);
  });
});

describe('toggleDocument', () => {
  let toggleDocument: typeof import('@/lib/dossier').toggleDocument;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    toggleDocument = mod.toggleDocument;
  });

  it('retourne null si le document n\'existe pas', async () => {
    mockUpdateReturning.mockResolvedValueOnce([]);

    const result = await toggleDocument('doc-inconnu', true, 'author-1');

    expect(result).toBeNull();
  });

  it('marque un document comme recu et insere une entree historique', async () => {
    const fakeDoc = {
      id: 'doc-1',
      dossierId: 'dossier-uuid-1',
      type: 'assurance',
      label: 'Attestation assurance habitation',
      received: true,
    };
    mockUpdateReturning.mockResolvedValueOnce([fakeDoc]);
    mockInsertReturning.mockResolvedValueOnce([]);

    const result = await toggleDocument('doc-1', true, 'author-1');

    expect(result).toEqual(fakeDoc);
    expect(mockInsert).toHaveBeenCalled();
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        dossierId: 'dossier-uuid-1',
        type: 'document',
      }),
    );
  });

  it('marque un document comme non recu et insere une entree historique', async () => {
    const fakeDoc = {
      id: 'doc-1',
      dossierId: 'dossier-uuid-1',
      type: 'assurance',
      label: 'Attestation assurance habitation',
      received: false,
    };
    mockUpdateReturning.mockResolvedValueOnce([fakeDoc]);
    mockInsertReturning.mockResolvedValueOnce([]);

    const result = await toggleDocument('doc-1', false, 'author-1');

    expect(result).toEqual(fakeDoc);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'document',
        content: expect.stringContaining('non recu'),
      }),
    );
  });
});

describe('addNote', () => {
  let addNote: typeof import('@/lib/dossier').addNote;

  beforeEach(async () => {
    vi.resetAllMocks();
    restoreDefaultMockImplementations();
    const mod = await import('@/lib/dossier');
    addNote = mod.addNote;
  });

  it('retourne null si le dossier n\'existe pas', async () => {
    // Select dossier : non trouve
    mockSelectLimit.mockResolvedValueOnce([]);

    const result = await addNote('dossier-inconnu', 'Un commentaire', 'author-1');

    expect(result).toBeNull();
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('insere une note et retourne l\'entree creee', async () => {
    const fakeEntry = {
      id: 'hist-note-1',
      dossierId: 'dossier-uuid-1',
      type: 'note',
      content: 'Un commentaire important',
      authorId: 'author-1',
      createdAt: new Date(),
    };
    // Select dossier : trouve
    mockSelectLimit.mockResolvedValueOnce([{ id: 'dossier-uuid-1' }]);
    // Insert note
    mockInsertReturning.mockResolvedValueOnce([fakeEntry]);

    const result = await addNote('dossier-uuid-1', 'Un commentaire important', 'author-1');

    expect(result).toEqual(fakeEntry);
    expect(mockInsertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        dossierId: 'dossier-uuid-1',
        type: 'note',
        content: 'Un commentaire important',
        authorId: 'author-1',
      }),
    );
  });
});
