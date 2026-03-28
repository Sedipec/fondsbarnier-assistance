import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
const mockAuth = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/utils/serverAuth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/db', () => {
  const selectFn = (...args: unknown[]) => mockSelect(...args);
  return {
    db: {
      select: selectFn,
    },
  };
});

vi.mock('@/db/schema', () => ({
  sources: {
    id: 'id',
    slug: 'slug',
    label: 'label',
  },
}));

vi.mock('drizzle-orm', () => ({
  asc: (col: unknown) => col,
}));

// Import apres les mocks
import { GET } from '../route';

describe('GET /api/v1/sources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 401 si non authentifie', async () => {
    mockAuth.mockResolvedValueOnce(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe('Non autorise.');
  });

  it('retourne la liste des sources', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } });

    const mockData = [
      { id: '1', slug: 'appel', label: 'Appel telephonique' },
      { id: '2', slug: 'portail', label: 'Portail client' },
    ];

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        orderBy: vi.fn().mockResolvedValueOnce(mockData),
      }),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual(mockData);
    expect(body.count).toBe(2);
  });

  it('retourne 500 si la base de donnees est inaccessible', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'user-1' } });

    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValueOnce({
        orderBy: vi.fn().mockRejectedValueOnce(new Error('Connection refused')),
      }),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Erreur lors du chargement des sources.');
  });
});
