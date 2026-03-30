import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import BottomNav from '../BottomNav';

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock next-auth/react
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

const adminSession = {
  data: {
    user: {
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
    },
  },
  status: 'authenticated' as const,
};

const clientSession = {
  data: {
    user: {
      name: 'Client User',
      email: 'client@test.com',
      role: 'client',
    },
  },
  status: 'authenticated' as const,
};

describe('BottomNav', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
    mockUseSession.mockReturnValue(adminSession);
  });

  it('ne rend rien si pas de session', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    const { container } = render(<BottomNav />);
    expect(container.innerHTML).toBe('');
  });

  describe('admin', () => {
    it('affiche la navigation admin', () => {
      render(<BottomNav />);
      expect(screen.getByText('Accueil')).toBeInTheDocument();
      expect(screen.getByText('Dossiers')).toBeInTheDocument();
      expect(screen.getByText('Parametres')).toBeInTheDocument();
    });

    it("n'affiche pas les items client", () => {
      render(<BottomNav />);
      expect(screen.queryByText('Mon dossier')).not.toBeInTheDocument();
    });
  });

  describe('client', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(clientSession);
      mockUsePathname.mockReturnValue('/espace/mon-dossier');
    });

    it('affiche la navigation client', () => {
      render(<BottomNav />);
      expect(screen.getByText('Mon dossier')).toBeInTheDocument();
      expect(screen.getByText('Parametres')).toBeInTheDocument();
    });

    it("n'affiche pas les items admin", () => {
      render(<BottomNav />);
      expect(screen.queryByText('Accueil')).not.toBeInTheDocument();
      expect(screen.queryByText('Dossiers')).not.toBeInTheDocument();
      expect(screen.queryByText('Suivi')).not.toBeInTheDocument();
    });
  });

  describe('route active', () => {
    it('marque la route exacte comme active', () => {
      mockUsePathname.mockReturnValue('/admin/dashboard');
      render(<BottomNav />);
      const accueilLink = screen.getByText('Accueil').closest('a');
      expect(accueilLink).toHaveAttribute('aria-current', 'page');
    });

    it('marque une sous-route comme active', () => {
      mockUsePathname.mockReturnValue('/admin/dossiers/123');
      render(<BottomNav />);
      const dossiersLink = screen.getByText('Dossiers').closest('a');
      expect(dossiersLink).toHaveAttribute('aria-current', 'page');
    });

    it('ne marque pas les routes inactives', () => {
      mockUsePathname.mockReturnValue('/admin/dashboard');
      render(<BottomNav />);
      const dossiersLink = screen.getByText('Dossiers').closest('a');
      expect(dossiersLink).not.toHaveAttribute('aria-current');
    });
  });

  it('a le bon aria-label', () => {
    render(<BottomNav />);
    expect(
      screen.getByLabelText('Navigation mobile'),
    ).toBeInTheDocument();
  });
});
