import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mocks
const mockFindFirst = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('@/db', () => ({
  db: {
    query: {
      users: {
        findFirst: (...args: unknown[]) => mockFindFirst(...args),
      },
    },
    insert: () => ({
      values: () => ({
        returning: () => mockInsert(),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: () => mockUpdate(),
        }),
      }),
    }),
  },
}));

vi.mock('@/db/schema', () => ({
  users: { email: 'email', id: 'id', role: 'role' },
  adminInvitations: {
    token: 'token',
    email: 'email',
    expiresAt: 'expiresAt',
    usedAt: 'usedAt',
    id: 'id',
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed-password'),
  },
}));

vi.mock('drizzle-orm', () => ({
  eq: vi.fn(),
  and: vi.fn(),
  gt: vi.fn(),
  isNull: vi.fn(),
}));

import { POST } from '../route';

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: 'Jean Dupont',
  email: 'jean@example.com',
  password: 'motdepasse123',
};

describe('POST /api/v1/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 400 si champs requis manquants', async () => {
    const res = await POST(makeRequest({ name: '', email: '', password: '' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('requis');
  });

  it('retourne 400 si mot de passe trop court', async () => {
    const res = await POST(
      makeRequest({ name: 'Test', email: 'a@b.com', password: 'short' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('8 caractères');
  });

  it('retourne 409 si email déjà utilisé', async () => {
    mockFindFirst.mockResolvedValueOnce({ id: 'existing-user' });
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain('existe déjà');
  });

  it('retourne 201 pour une inscription réussie', async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    mockInsert.mockResolvedValueOnce([
      { id: 'new-user', email: 'jean@example.com', role: 'client' },
    ]);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data).toBeDefined();
  });

  it('retourne 409 pour contrainte d\'unicité PostgreSQL (code 23505)', async () => {
    mockFindFirst.mockResolvedValueOnce(null);
    const pgError = new Error('duplicate key value');
    (pgError as { code?: string }).code = '23505';
    mockInsert.mockRejectedValueOnce(pgError);
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain('existe déjà');
  });

  it('retourne 503 pour erreur de connexion base de données', async () => {
    mockFindFirst.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toContain('temporairement indisponible');
  });

  it('retourne 500 pour erreur inconnue', async () => {
    mockFindFirst.mockRejectedValueOnce(new Error('something unexpected'));
    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain('erreur est survenue');
  });

  it('ne log pas l\'objet d\'erreur complet', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorWithSensitiveData = new Error('connection to postgresql://user:pass@host failed');
    mockFindFirst.mockRejectedValueOnce(errorWithSensitiveData);
    await POST(makeRequest(validBody));
    // Vérifie que le deuxième argument est le message, pas l'objet erreur
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[register]'),
      expect.any(String),
    );
    consoleSpy.mockRestore();
  });
});
