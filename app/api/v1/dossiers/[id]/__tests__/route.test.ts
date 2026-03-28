import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks
const mockAuth = vi.fn();
const mockGetDossierById = vi.fn();
const mockUpdateDossier = vi.fn();
const mockAdvanceEtape = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/dossier', () => ({
  getDossierById: (id: unknown) => mockGetDossierById(id),
  updateDossier: (id: unknown, data: unknown) => mockUpdateDossier(id, data),
  advanceEtape: (id: unknown, etape: unknown, userId: unknown) =>
    mockAdvanceEtape(id, etape, userId),
}));

// Import apres les mocks
import { GET, PATCH } from '../route';

function makeGetRequest(id = 'dossier-1'): [NextRequest, { params: Promise<{ id: string }> }] {
  return [
    new NextRequest(`http://localhost/api/v1/dossiers/${id}`, { method: 'GET' }),
    { params: Promise.resolve({ id }) },
  ];
}

function makePatchRequest(
  body: unknown,
  id = 'dossier-1',
): [NextRequest, { params: Promise<{ id: string }> }] {
  return [
    new NextRequest(`http://localhost/api/v1/dossiers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  ];
}

const fakeDossier = {
  id: 'dossier-1',
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  reference: 'FB-2026-0001',
  statut: 'actif',
  etape: 1,
};

describe('GET /api/v1/dossiers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 403 si pas admin (role client)', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });

    const [req, ctx] = makeGetRequest();
    const response = await GET(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Acces refuse.');
  });

  it('retourne 403 si pas de session', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const [req, ctx] = makeGetRequest();
    const response = await GET(req, ctx);

    expect(response.status).toBe(403);
  });

  it('retourne 404 si dossier introuvable', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockGetDossierById.mockResolvedValueOnce(null);

    const [req, ctx] = makeGetRequest();
    const response = await GET(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Dossier introuvable.');
  });

  it('retourne 200 avec les donnees du dossier en cas de succes', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockGetDossierById.mockResolvedValueOnce(fakeDossier);

    const [req, ctx] = makeGetRequest('dossier-1');
    const response = await GET(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(fakeDossier);
    expect(mockGetDossierById).toHaveBeenCalledWith('dossier-1');
  });
});

describe('PATCH /api/v1/dossiers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 403 si pas admin', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });

    const [req, ctx] = makePatchRequest({ nom: 'Martin' });
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Acces refuse.');
  });

  it('retourne 400 si corps JSON invalide', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const req = new NextRequest('http://localhost/api/v1/dossiers/dossier-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const ctx = { params: Promise.resolve({ id: 'dossier-1' }) };

    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Corps de requete invalide.');
  });

  describe('avec le champ etape', () => {
    it('appelle advanceEtape et retourne 404 si dossier introuvable', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'admin' },
      });
      mockAdvanceEtape.mockResolvedValueOnce(null);

      const [req, ctx] = makePatchRequest({ etape: 2 }, 'dossier-1');
      const response = await PATCH(req, ctx);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Dossier introuvable.');
      expect(mockAdvanceEtape).toHaveBeenCalledWith('dossier-1', 2, 'admin-1');
    });

    it('retourne 400 si advanceEtape leve une erreur', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'admin' },
      });
      mockAdvanceEtape.mockRejectedValueOnce(
        new Error('Etape invalide : doit etre superieure a l\'etape actuelle.'),
      );

      const [req, ctx] = makePatchRequest({ etape: 0 }, 'dossier-1');
      const response = await PATCH(req, ctx);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toContain('Etape invalide');
    });

    it('retourne 200 avec le dossier mis a jour en cas de succes', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'admin' },
      });
      const updatedDossier = { ...fakeDossier, etape: 2 };
      mockAdvanceEtape.mockResolvedValueOnce(updatedDossier);

      const [req, ctx] = makePatchRequest({ etape: 2 }, 'dossier-1');
      const response = await PATCH(req, ctx);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(updatedDossier);
    });
  });

  describe('mise a jour des champs', () => {
    it('retourne 400 si aucun champ autorise dans le body', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'admin' },
      });

      const [req, ctx] = makePatchRequest({ champInconnu: 'valeur' });
      const response = await PATCH(req, ctx);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Aucun champ a mettre a jour.');
    });

    it('retourne 404 si updateDossier retourne null', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'admin' },
      });
      mockUpdateDossier.mockResolvedValueOnce(null);

      const [req, ctx] = makePatchRequest({ nom: 'Martin' }, 'dossier-1');
      const response = await PATCH(req, ctx);
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe('Dossier introuvable.');
    });

    it('retourne 200 avec le dossier mis a jour en cas de succes', async () => {
      mockAuth.mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'admin' },
      });
      const updatedDossier = { ...fakeDossier, nom: 'Martin' };
      mockUpdateDossier.mockResolvedValueOnce(updatedDossier);

      const [req, ctx] = makePatchRequest({ nom: 'Martin' }, 'dossier-1');
      const response = await PATCH(req, ctx);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data).toEqual(updatedDossier);
      expect(mockUpdateDossier).toHaveBeenCalledWith(
        'dossier-1',
        expect.objectContaining({ nom: 'Martin' }),
      );
    });
  });
});
