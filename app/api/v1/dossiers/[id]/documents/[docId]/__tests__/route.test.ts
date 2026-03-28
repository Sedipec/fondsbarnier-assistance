import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks
const mockAuth = vi.fn();
const mockToggleDocument = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/dossier', () => ({
  toggleDocument: (docId: unknown, received: unknown, userId: unknown) =>
    mockToggleDocument(docId, received, userId),
}));

// Import apres les mocks
import { PATCH } from '../route';

function makePatchRequest(
  body: unknown,
  id = 'dossier-1',
  docId = 'doc-1',
): [NextRequest, { params: Promise<{ id: string; docId: string }> }] {
  return [
    new NextRequest(
      `http://localhost/api/v1/dossiers/${id}/documents/${docId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    ),
    { params: Promise.resolve({ id, docId }) },
  ];
}

const fakeDoc = {
  id: 'doc-1',
  dossierId: 'dossier-1',
  type: 'identite',
  received: true,
  receivedAt: '2026-03-28T00:00:00.000Z',
};

describe('PATCH /api/v1/dossiers/[id]/documents/[docId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 403 si pas admin (role client)', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });

    const [req, ctx] = makePatchRequest({ received: true });
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Acces refuse.');
  });

  it('retourne 403 si pas de session', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const [req, ctx] = makePatchRequest({ received: true });
    const response = await PATCH(req, ctx);

    expect(response.status).toBe(403);
  });

  it('retourne 400 si corps JSON invalide', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const req = new NextRequest(
      'http://localhost/api/v1/dossiers/dossier-1/documents/doc-1',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      },
    );
    const ctx = { params: Promise.resolve({ id: 'dossier-1', docId: 'doc-1' }) };

    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Corps de requete invalide.');
  });

  it('retourne 400 si received n\'est pas un boolean', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const [req, ctx] = makePatchRequest({ received: 'oui' });
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"received"');
  });

  it('retourne 400 si received est absent', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const [req, ctx] = makePatchRequest({});
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"received"');
  });

  it('retourne 404 si toggleDocument retourne null', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockToggleDocument.mockResolvedValueOnce(null);

    const [req, ctx] = makePatchRequest({ received: true }, 'dossier-1', 'doc-inexistant');
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Document introuvable.');
  });

  it('retourne 200 avec le document mis a jour en cas de succes', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockToggleDocument.mockResolvedValueOnce(fakeDoc);

    const [req, ctx] = makePatchRequest({ received: true }, 'dossier-1', 'doc-1');
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(fakeDoc);
    expect(mockToggleDocument).toHaveBeenCalledWith('doc-1', true, 'admin-1');
  });

  it('retourne 200 avec received=false pour marquer un document non recu', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    const docNonRecu = { ...fakeDoc, received: false, receivedAt: null };
    mockToggleDocument.mockResolvedValueOnce(docNonRecu);

    const [req, ctx] = makePatchRequest({ received: false }, 'dossier-1', 'doc-1');
    const response = await PATCH(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.received).toBe(false);
    expect(mockToggleDocument).toHaveBeenCalledWith('doc-1', false, 'admin-1');
  });
});
