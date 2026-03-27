import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Navbar from '../Navbar';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Navbar', () => {
  it('affiche le nom du projet', () => {
    render(<Navbar />);
    expect(
      screen.getByRole('link', { name: /fondsbarnierassistance/i }),
    ).toBeInTheDocument();
  });

  it('contient un lien vers la page A propos', () => {
    render(<Navbar />);
    const link = screen.getByRole('link', { name: /a propos/i });
    expect(link).toHaveAttribute('href', '/about');
  });

  it("contient un lien vers l'accueil", () => {
    render(<Navbar />);
    const link = screen.getByRole('link', {
      name: /fondsbarnierassistance/i,
    });
    expect(link).toHaveAttribute('href', '/');
  });

  it('affiche les liens de connexion et inscription si non connecte', () => {
    render(<Navbar />);
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByText('Inscription')).toBeInTheDocument();
  });
});
