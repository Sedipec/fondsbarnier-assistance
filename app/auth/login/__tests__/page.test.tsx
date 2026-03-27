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
}));

import LoginPage from '../page';

describe('LoginPage', () => {
  it('affiche le formulaire de connexion', () => {
    render(<LoginPage />);
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
  });

  it('affiche le bouton de connexion', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('button', { name: 'Se connecter' }),
    ).toBeInTheDocument();
  });

  it('affiche le bouton Google', () => {
    render(<LoginPage />);
    expect(
      screen.getByRole('button', { name: 'Continuer avec Google' }),
    ).toBeInTheDocument();
  });

  it('affiche le lien vers inscription', () => {
    render(<LoginPage />);
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
  });
});
