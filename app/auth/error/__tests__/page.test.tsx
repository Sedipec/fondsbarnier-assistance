import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock next/navigation
const mockGet = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

import AuthErrorPage from '../page';

describe('AuthErrorPage', () => {
  it('affiche le message par défaut quand aucun type d\'erreur', () => {
    mockGet.mockReturnValue(null);
    render(<AuthErrorPage />);
    expect(
      screen.getByText('Une erreur inattendue est survenue. Veuillez réessayer.'),
    ).toBeInTheDocument();
  });

  it('affiche le message Configuration', () => {
    mockGet.mockReturnValue('Configuration');
    render(<AuthErrorPage />);
    expect(
      screen.getByText(/problème de configuration du serveur/),
    ).toBeInTheDocument();
  });

  it('affiche le message CredentialsSignin', () => {
    mockGet.mockReturnValue('CredentialsSignin');
    render(<AuthErrorPage />);
    expect(
      screen.getByText(/Email ou mot de passe incorrect/),
    ).toBeInTheDocument();
  });

  it('affiche le message OAuthAccountNotLinked', () => {
    mockGet.mockReturnValue('OAuthAccountNotLinked');
    render(<AuthErrorPage />);
    expect(
      screen.getByText(/déjà associé à un autre mode de connexion/),
    ).toBeInTheDocument();
  });

  it('affiche le message par défaut pour un type inconnu', () => {
    mockGet.mockReturnValue('UnknownType');
    render(<AuthErrorPage />);
    expect(
      screen.getByText('Une erreur inattendue est survenue. Veuillez réessayer.'),
    ).toBeInTheDocument();
  });

  it('affiche les liens de navigation', () => {
    mockGet.mockReturnValue(null);
    render(<AuthErrorPage />);
    expect(screen.getByText('Retour à la connexion')).toBeInTheDocument();
    expect(screen.getByText(/Retour à l'accueil/)).toBeInTheDocument();
  });

  it('affiche le titre d\'erreur', () => {
    mockGet.mockReturnValue(null);
    render(<AuthErrorPage />);
    expect(
      screen.getByText(/Erreur d/),
    ).toBeInTheDocument();
  });
});
