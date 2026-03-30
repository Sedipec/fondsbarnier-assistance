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

// Mock NotificationBell (utilise fetch/useSession en interne)
vi.mock('@/components/shared/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell" />,
}));

// Mock SignOutButton
vi.mock('@/components/auth/SignOutButton', () => ({
  SignOutButton: () => <button>Deconnexion</button>,
}));

describe('Navbar', () => {
  it('affiche le nom du projet', () => {
    render(<Navbar />);
    expect(
      screen.getByRole('link', { name: /fb.*fondsbarnier/i }),
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
      name: /fb.*fondsbarnier/i,
    });
    expect(link).toHaveAttribute('href', '/');
  });

  it('affiche les liens de connexion et inscription si non connecte', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Connexion').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Obtenir un devis').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche un bouton burger sur mobile', () => {
    render(<Navbar />);
    const burgerButton = screen.getByRole('button', { name: /menu/i });
    expect(burgerButton).toBeInTheDocument();
  });
});
