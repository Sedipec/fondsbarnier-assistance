import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileForm from '../ProfileForm';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('ProfileForm', () => {
  it('affiche les donnees du profil apres chargement', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { name: 'Jean Dupont', email: 'jean@example.com', phone: '+33 6 00 00 00 00' },
      }),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jean@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+33 6 00 00 00 00')).toBeInTheDocument();
    });
  });

  it('affiche une erreur API si la reponse est non-OK', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Non autorisé.' }),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByText('Non autorisé.')).toBeInTheDocument();
    });
  });

  it('affiche le message par defaut si la reponse non-OK sans error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger le profil.')).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le fetch echoue completement', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ProfileForm />);

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger le profil.')).toBeInTheDocument();
    });
  });
});
