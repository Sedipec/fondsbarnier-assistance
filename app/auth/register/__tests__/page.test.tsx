import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

import RegisterPage from '../page';

describe('RegisterPage', () => {
  it('affiche le formulaire d inscription', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });

  it('affiche les champs requis', () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText('Nom complet')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Confirmer le mot de passe'),
    ).toBeInTheDocument();
  });

  it('affiche le bouton d inscription', () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole('button', { name: "S'inscrire" }),
    ).toBeInTheDocument();
  });

  it('affiche le bouton Google', () => {
    render(<RegisterPage />);
    expect(
      screen.getByRole('button', { name: 'Continuer avec Google' }),
    ).toBeInTheDocument();
  });

  it('affiche le lien vers connexion', () => {
    render(<RegisterPage />);
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });
});
