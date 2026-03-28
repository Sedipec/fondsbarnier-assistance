import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockAuth = vi.fn();
const mockGetDossierByUserId = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/dossier', () => ({
  getDossierByUserId: (userId: unknown) => mockGetDossierByUserId(userId),
}));

// Import apres les mocks
import { GET } from '../route';

const fakeDossier = {
  id: 'dossier-1',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  reference: 'FB-2026-0001',
  statut: 'actif',
  etape: 1,
  userId: 'user-1',
};

describe('GET /api/v1/dossiers/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 401 si pas de session', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Non autorise.');
  });

  it('retourne 401 si session sans user.id', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { role: 'client' },
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Non autorise.');
  });

  it('retourne 401 si session avec user null', async () => {
    mockAuth.mockResolvedValueOnce({
      user: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Non autorise.');
  });

  it('retourne 404 si getDossierByUserId retourne null', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-sans-dossier', role: 'client' },
    });
    mockGetDossierByUserId.mockResolvedValueOnce(null);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Aucun dossier trouve.');
  });

  it('retourne 200 avec le dossier en cas de succes', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });
    mockGetDossierByUserId.mockResolvedValueOnce(fakeDossier);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(fakeDossier);
    expect(mockGetDossierByUserId).toHaveBeenCalledWith('user-1');
  });

  it('fonctionne aussi pour un utilisateur admin', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockGetDossierByUserId.mockResolvedValueOnce(fakeDossier);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(fakeDossier);
    expect(mockGetDossierByUserId).toHaveBeenCalledWith('admin-1');
  });
});
