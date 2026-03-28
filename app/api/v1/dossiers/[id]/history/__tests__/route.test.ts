import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks
const mockAuth = vi.fn();
const mockAddNote = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/dossier', () => ({
  addNote: (id: unknown, content: unknown, userId: unknown) =>
    mockAddNote(id, content, userId),
}));

// Import apres les mocks
import { POST } from '../route';

function makePostRequest(
  body: unknown,
  id = 'dossier-1',
): [NextRequest, { params: Promise<{ id: string }> }] {
  return [
    new NextRequest(`http://localhost/api/v1/dossiers/${id}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) },
  ];
}

const fakeHistoryEntry = {
  id: 'history-1',
  dossierId: 'dossier-1',
  content: 'Note de suivi ajoutee.',
  authorId: 'admin-1',
  createdAt: '2026-03-28T00:00:00.000Z',
};

describe('POST /api/v1/dossiers/[id]/history', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 403 si pas admin (role client)', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'user-1', role: 'client' },
    });

    const [req, ctx] = makePostRequest({ content: 'Une note.' });
    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Acces refuse.');
  });

  it('retourne 403 si pas de session', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const [req, ctx] = makePostRequest({ content: 'Une note.' });
    const response = await POST(req, ctx);

    expect(response.status).toBe(403);
  });

  it('retourne 400 si corps JSON invalide', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const req = new NextRequest(
      'http://localhost/api/v1/dossiers/dossier-1/history',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json',
      },
    );
    const ctx = { params: Promise.resolve({ id: 'dossier-1' }) };

    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toBe('Corps de requete invalide.');
  });

  it('retourne 400 si content est absent', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const [req, ctx] = makePostRequest({});
    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"content"');
  });

  it('retourne 400 si content est une chaine vide', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const [req, ctx] = makePostRequest({ content: '' });
    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"content"');
  });

  it('retourne 400 si content ne contient que des espaces', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });

    const [req, ctx] = makePostRequest({ content: '   ' });
    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.error).toContain('"content"');
  });

  it('retourne 404 si addNote retourne null (dossier introuvable)', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockAddNote.mockResolvedValueOnce(null);

    const [req, ctx] = makePostRequest({ content: 'Une note.' }, 'dossier-inexistant');
    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('Dossier introuvable.');
  });

  it('retourne 201 avec l\'entree creee en cas de succes', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockAddNote.mockResolvedValueOnce(fakeHistoryEntry);

    const [req, ctx] = makePostRequest(
      { content: 'Note de suivi ajoutee.' },
      'dossier-1',
    );
    const response = await POST(req, ctx);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data).toEqual(fakeHistoryEntry);
    expect(mockAddNote).toHaveBeenCalledWith(
      'dossier-1',
      'Note de suivi ajoutee.',
      'admin-1',
    );
  });

  it('transmet le contenu avec trim() avant l\'appel a addNote', async () => {
    mockAuth.mockResolvedValueOnce({
      user: { id: 'admin-1', role: 'admin' },
    });
    mockAddNote.mockResolvedValueOnce(fakeHistoryEntry);

    const [req, ctx] = makePostRequest(
      { content: '  Note avec espaces.  ' },
      'dossier-1',
    );
    await POST(req, ctx);

    expect(mockAddNote).toHaveBeenCalledWith(
      'dossier-1',
      'Note avec espaces.',
      'admin-1',
    );
  });
});
