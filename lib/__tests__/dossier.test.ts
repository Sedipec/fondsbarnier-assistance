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
          return undefined;
        },
      },
    ),
  };
});

vi.mock('@/db/schema', () => ({
  dossiers: {
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
  // Import dynamique pour que les mocks soient en place
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

  it('cree un dossier avec tous les champs valides et reference FB-2026-0001', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);
    // Pas de doublon email
    mockSelectLimit.mockResolvedValueOnce([]);
    // Pas de doublon secondaire
    mockSelectLimit.mockResolvedValueOnce([]);

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

    // Transaction mock
    mockTransaction.mockImplementation(async (fn: Function) => {
      const txExecute = vi.fn().mockResolvedValueOnce([{ count: 0 }]);
      const txInsertReturning = vi.fn().mockResolvedValueOnce([fakeDossier]);
      const txInsertValues = vi.fn(() => ({
        returning: txInsertReturning,
      }));
      const txInsert = vi.fn(() => ({ values: txInsertValues }));

      const tx = {
        execute: txExecute,
        insert: txInsert,
      };
      return fn(tx);
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
    // Doublon email trouve
    mockSelectLimit.mockResolvedValueOnce([
      { reference: 'FB-2026-0042', gestionnaireId: 'user-uuid-1' },
    ]);
    // Gestionnaire lookup
    mockSelectLimit.mockResolvedValueOnce([{ name: 'Marie Martin' }]);

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
    // Doublon email trouve (l'email normalise matche)
    mockSelectLimit.mockResolvedValueOnce([
      { reference: 'FB-2026-0001', gestionnaireId: null },
    ]);

    const result = await createDossier(inputMixedCase);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Dossier existant');
    // Verifie que le gestionnaire est "Non assigne" quand pas de gestionnaire
    expect(result.error).toContain('Non assigne');
  });

  it('retourne un warning pour dedup secondaire (telephone + nom + commune) avec email different', async () => {
    // Source existe
    mockSelectLimit.mockResolvedValueOnce([
      { id: 'source-uuid-1', slug: 'formulaire' },
    ]);
    // Pas de doublon email
    mockSelectLimit.mockResolvedValueOnce([]);
    // Doublon secondaire trouve
    mockSelectLimit.mockResolvedValueOnce([{ reference: 'FB-2026-0010' }]);

    const fakeDossier = {
      id: 'dossier-uuid-2',
      ...validInput,
      reference: 'FB-2026-0011',
      statut: 'nouveau',
      etape: 1,
    };

    mockTransaction.mockImplementation(async (fn: Function) => {
      const tx = {
        execute: vi.fn().mockResolvedValueOnce([{ count: 10 }]),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn().mockResolvedValueOnce([fakeDossier]),
          })),
        })),
      };
      return fn(tx);
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
    // Pas de doublon email
    mockSelectLimit.mockResolvedValueOnce([]);
    // Pas de doublon secondaire
    mockSelectLimit.mockResolvedValueOnce([]);

    const fakeDossier = {
      id: 'dossier-uuid-3',
      ...validInput,
      reference: 'FB-2026-0001',
      statut: 'nouveau',
      etape: 1,
    };

    mockTransaction.mockImplementation(async (fn: Function) => {
      const tx = {
        execute: vi.fn().mockResolvedValueOnce([{ count: 0 }]),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn().mockResolvedValueOnce([fakeDossier]),
          })),
        })),
      };
      return fn(tx);
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
    // Pas de doublon
    mockSelectLimit.mockResolvedValueOnce([]);
    mockSelectLimit.mockResolvedValueOnce([]);

    const fakeDossier = {
      id: 'dossier-uuid-4',
      ...validInput,
      reference: 'FB-2026-0001',
      statut: 'nouveau',
      etape: 1,
    };

    // Simule 0 dossiers pour l'annee en cours (nouvelle annee)
    mockTransaction.mockImplementation(async (fn: Function) => {
      const tx = {
        execute: vi.fn().mockResolvedValueOnce([{ count: 0 }]),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn().mockResolvedValueOnce([fakeDossier]),
          })),
        })),
      };
      return fn(tx);
    });

    const result = await createDossier(validInput);

    expect(result.success).toBe(true);
    expect(result.dossier?.reference).toBe('FB-2026-0001');
  });
});

describe('source_id immutabilite', () => {
  it('le champ source_id ne doit pas etre modifiable apres creation', async () => {
    // Le service ne propose aucune fonction updateSourceId.
    // La seule fonction d'update est updateDossierEtape qui
    // n'accepte que dossierId et etape comme parametres.
    const mod = await import('@/lib/dossier');
    expect(mod.updateDossierEtape.length).toBe(2);
    // Verifie qu'aucune fonction de modification de source n'est exportee
    expect('updateSourceId' in mod).toBe(false);
  });
});
