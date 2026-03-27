import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks
const mockAuth = vi.fn();
const mockCreateDossier = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/dossier', () => ({
  createDossier: (input: unknown) => mockCreateDossier(input),
}));

// Import apres les mocks
import { POST } from '../route';

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/v1/dossiers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  nom: 'Dupont',
  prenom: 'Jean',
  email: 'jean@example.com',
  telephone: '0612345678',
  commune: 'Paris',
  typeDeBien: 'Maison',
  sourceId: 'source-uuid-1',
};

describe('POST /api/v1/dossiers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Auth ---

  it('retourne 403 si pas de session', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Acces refuse.');
  });

  it('retourne 403 si role non admin', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Acces refuse.');
  });

  // --- Validation ---

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

  it('retourne 400 si un champ requis est vide (string vide)', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const response = await POST(makeRequest({ ...validBody, nom: '   ' }));
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"nom"');
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

  // --- Succes ---

  it('retourne 201 avec le dossier cree en cas de succes', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const fakeDossier = {
      id: 'dossier-uuid-1',
      ...validBody,
      reference: 'FB-2026-0001',
      statut: 'nouveau',
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
    expect(json.warning).toBeUndefined();
  });

  it('retourne 201 avec warning si dedup secondaire', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    const fakeDossier = {
      id: 'dossier-uuid-2',
      ...validBody,
      reference: 'FB-2026-0002',
    };

    mockCreateDossier.mockResolvedValueOnce({
      success: true,
      dossier: fakeDossier,
      warning: 'Dossier potentiellement similaire — #FB-2026-0001',
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data).toBeDefined();
    expect(json.warning).toContain('potentiellement similaire');
  });

  // --- Erreurs metier ---

  it('retourne 409 si doublon email', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    mockCreateDossier.mockResolvedValueOnce({
      success: false,
      error: 'Dossier existant — #FB-2026-0042 (gestionnaire : Marie Martin)',
    });

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('Dossier existant');
  });

  // --- Error handling (pas de fuite d'implementation) ---

  it('retourne 500 avec message generique si createDossier throw', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    mockCreateDossier.mockRejectedValueOnce(
      new Error('connection refused to database at 10.0.0.1:5432'),
    );

    const response = await POST(makeRequest(validBody));
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Erreur interne lors de la creation du dossier.');
    // Verifie qu'aucune info d'implementation ne fuite
    expect(JSON.stringify(json)).not.toContain('connection');
    expect(JSON.stringify(json)).not.toContain('database');
    expect(JSON.stringify(json)).not.toContain('5432');
  });

  // --- Champs optionnels ---

  it('passe les champs optionnels a createDossier', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'admin' },
    });

    mockCreateDossier.mockResolvedValueOnce({
      success: true,
      dossier: { id: 'dossier-uuid-3', reference: 'FB-2026-0003' },
    });

    const bodyWithOptional = {
      ...validBody,
      adresseComplete: '12 rue des Lilas',
      numeroCadastre: 'AB-1234',
      gestionnaireId: 'user-uuid-2',
    };

    await POST(makeRequest(bodyWithOptional));

    expect(mockCreateDossier).toHaveBeenCalledWith(
      expect.objectContaining({
        adresseComplete: '12 rue des Lilas',
        numeroCadastre: 'AB-1234',
        gestionnaireId: 'user-uuid-2',
      }),
    );
  });
});
