import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks
const mockAuth = vi.fn();
const mockCreateDossier = vi.fn();
const mockListDossiers = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/dossier', () => ({
  createDossier: (input: unknown) => mockCreateDossier(input),
  listDossiers: (params: unknown) => mockListDossiers(params),
}));

// Import apres les mocks
import { GET, POST } from '../route';

function makeRequest(
  body: unknown,
  method = 'POST',
  url = 'http://localhost/api/v1/dossiers',
): NextRequest {
  if (method === 'GET') {
    return new NextRequest(url, { method: 'GET' });
  }
  return new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  sourceId: 'source-uuid-1',
};

describe('GET /api/v1/dossiers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 403 si pas admin', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });

    const response = await GET(
      makeRequest(null, 'GET', 'http://localhost/api/v1/dossiers'),
    );
    expect(response.status).toBe(403);
  });

  it('retourne la liste paginee des dossiers', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    mockListDossiers.mockResolvedValueOnce({
      data: [{ id: 'd1', reference: 'FB-2026-0001' }],
      count: 1,
    });

    const response = await GET(
      makeRequest(
        null,
        'GET',
        'http://localhost/api/v1/dossiers?page=1&limit=20',
      ),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.count).toBe(1);
  });
});

describe('POST /api/v1/dossiers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 401 si pas de session', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Non autorise.');
  });

  it('retourne 400 si corps JSON invalide', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const request = new NextRequest('http://localhost/api/v1/dossiers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Corps de requete invalide.');
  });

  it('retourne 400 si un champ requis est manquant', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const { nom: _, ...bodyWithoutNom } = validBody;

    const response = await POST(makeRequest(bodyWithoutNom));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"nom"');
    expect(json.error).toContain('requis');
  });

  it('retourne 400 si email invalide', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const response = await POST(
      makeRequest({ ...validBody, email: 'pas-un-email' }),
    );
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Format email invalide.');
  });

  it('retourne 201 avec le dossier cree en cas de succes', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const fakeDossier = {
      id: 'dossier-uuid-1',
      ...validBody,
      reference: 'FB-2026-0001',
      statut: 'actif',
      etape: 1,
    };

    mockCreateDossier.mockResolvedValueOnce({
      success: true,
      dossier: fakeDossier,
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data).toEqual(fakeDossier);
  });

  it('associe automatiquement le userId pour un client', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'client-uuid-1', role: 'client' },
    });

    mockCreateDossier.mockResolvedValueOnce({
      success: true,
      dossier: { id: 'dossier-uuid-1', reference: 'FB-2026-0001' },
    });

    await POST(makeRequest(validBody));

    expect(mockCreateDossier).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'client-uuid-1' }),
    );
  });

  it('retourne 409 si doublon email', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    mockCreateDossier.mockResolvedValueOnce({
      success: false,
      error: 'Un dossier existe deja avec cet email.',
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('existe deja');
  });

  it('retourne 500 avec message generique si createDossier throw', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    mockCreateDossier.mockRejectedValueOnce(new Error('connection refused'));

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Erreur interne lors de la creation du dossier.');
    expect(JSON.stringify(json)).not.toContain('connection');
  });
});
