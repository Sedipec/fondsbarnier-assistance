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
    const links = screen.getAllByRole('link', { name: /a propos/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('href', '/about');
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
    expect(screen.getAllByText('Connexion').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Inscription').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche un bouton burger sur mobile', () => {
    render(<Navbar />);
    const burgerButton = screen.getByRole('button');
    expect(burgerButton).toBeInTheDocument();
  });
});
