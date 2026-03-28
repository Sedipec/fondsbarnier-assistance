import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock des composants enfants pour isoler la logique de la page
vi.mock('@/components/dossier/DossierTable', () => ({
  default: () => <div data-testid="dossier-table" />,
}));

vi.mock('@/components/dossier/DossierFilters', () => ({
  default: () => <div data-testid="dossier-filters" />,
}));

vi.mock('@/components/dossier/DossierForm', () => ({
  default: ({
    sources,
    sourcesLoading,
  }: {
    sources: { id: string; slug: string; label: string }[];
    sourcesLoading: boolean;
  }) => (
    <div data-testid="dossier-form">
      {sourcesLoading && <span data-testid="sources-loading" />}
      {sources.map((s) => (
        <span key={s.id} data-testid={`source-${s.id}`}>
          {s.label}
        </span>
      ))}
    </div>
  ),
}));

import AdminDossiersPage from '../page';

const mockSources = [
  { id: 'src-1', slug: 'mairie', label: 'Mairie' },
  { id: 'src-2', slug: 'web', label: 'Site web' },
];

function mockFetchResponses() {
  return vi.fn((url: string | URL | Request, init?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : url.toString();

    // Réponse pour /api/v1/dossiers
    if (urlStr.includes('/api/v1/dossiers')) {
      return Promise.resolve(
        new Response(JSON.stringify({ data: [], count: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Réponse pour /api/v1/sources
    if (urlStr.includes('/api/v1/sources')) {
      if (init?.signal?.aborted) {
        return Promise.reject(new DOMException('Aborted', 'AbortError'));
      }
      return Promise.resolve(
        new Response(JSON.stringify({ data: mockSources }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    return Promise.resolve(
      new Response(JSON.stringify({}), { status: 404 }),
    );
  });
}

describe('AdminDossiersPage — refetch sources à l\'ouverture du modal', () => {
  let fetchMock: ReturnType<typeof mockFetchResponses>;

  beforeEach(() => {
    fetchMock = mockFetchResponses();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function sourcesCallCount() {
    return fetchMock.mock.calls.filter(([url]) =>
      String(url).includes('/api/v1/sources'),
    ).length;
  }

  it('appelle /api/v1/sources à l\'ouverture du modal', async () => {
    render(<AdminDossiersPage />);

    // Pas d'appel sources avant l'ouverture
    expect(sourcesCallCount()).toBe(0);

    // Ouvrir le modal
    fireEvent.click(screen.getByText('+ Nouveau dossier'));

    await waitFor(() => {
      expect(sourcesCallCount()).toBe(1);
    });
  });

  it('refetch les sources à chaque ouverture du modal, même si déjà chargées', async () => {
    render(<AdminDossiersPage />);

    // Première ouverture
    fireEvent.click(screen.getByText('+ Nouveau dossier'));
    await waitFor(() => {
      expect(sourcesCallCount()).toBe(1);
    });

    // Fermer le modal (clic sur le bouton X)
    fireEvent.click(screen.getByText('X'));
    await waitFor(() => {
      expect(screen.queryByTestId('dossier-form')).not.toBeInTheDocument();
    });

    // Deuxième ouverture — doit refetcher même si sources.length > 0
    fireEvent.click(screen.getByText('+ Nouveau dossier'));
    await waitFor(() => {
      expect(sourcesCallCount()).toBe(2);
    });
  });

  it('refetch les sources à la troisième ouverture successive', async () => {
    render(<AdminDossiersPage />);

    // Ouverture 1
    fireEvent.click(screen.getByText('+ Nouveau dossier'));
    await waitFor(() => expect(sourcesCallCount()).toBe(1));

    // Fermer
    fireEvent.click(screen.getByText('X'));
    await waitFor(() => {
      expect(screen.queryByTestId('dossier-form')).not.toBeInTheDocument();
    });

    // Ouverture 2
    fireEvent.click(screen.getByText('+ Nouveau dossier'));
    await waitFor(() => expect(sourcesCallCount()).toBe(2));

    // Fermer
    fireEvent.click(screen.getByText('X'));
    await waitFor(() => {
      expect(screen.queryByTestId('dossier-form')).not.toBeInTheDocument();
    });

    // Ouverture 3
    fireEvent.click(screen.getByText('+ Nouveau dossier'));
    await waitFor(() => expect(sourcesCallCount()).toBe(3));
  });

  it('ne fetch pas les sources quand le modal est fermé', async () => {
    render(<AdminDossiersPage />);

    // Attendre le chargement initial des dossiers
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Aucun appel sources sans ouverture du modal
    expect(sourcesCallCount()).toBe(0);
  });
});
