import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={props.alt} />
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/admin/dashboard'),
}));

// Mock next-auth/react
const mockSignOut = vi.fn();
const mockUseSession = vi.fn();
vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

const adminSession = {
  data: {
    user: {
      name: 'Admin User',
      email: 'admin@test.com',
      role: 'admin',
      image: null,
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
      image: null,
    },
  },
  status: 'authenticated' as const,
};

describe('Sidebar', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(adminSession);
    mockSignOut.mockClear();
  });

  it('ne rend rien si pas de session', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    const { container } = render(<Sidebar />);
    expect(container.innerHTML).toBe('');
  });

  describe('admin', () => {
    it('affiche la navigation admin', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Tableau de bord').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dossiers').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Param[eè]tres/).length).toBeGreaterThan(0);
    });

    it('affiche le badge Administrateur', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Administrateur').length).toBeGreaterThan(0);
    });

    it('affiche le label PRINCIPAL', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('PRINCIPAL').length).toBeGreaterThan(0);
    });

    it('affiche le badge compteur quand dossierCount est passe', () => {
      render(<Sidebar dossierCount={42} />);
      expect(screen.getAllByText('42').length).toBeGreaterThan(0);
    });

    it("n'affiche pas le badge compteur sans dossierCount", () => {
      render(<Sidebar />);
      expect(screen.queryByText('42')).not.toBeInTheDocument();
    });
  });

  describe('client', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue(clientSession);
    });

    it('affiche la navigation client', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Mon dossier').length).toBeGreaterThan(0);
    });

    it('affiche le badge Client', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Client').length).toBeGreaterThan(0);
    });

    it('affiche le label MON ESPACE', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('MON ESPACE').length).toBeGreaterThan(0);
    });
  });

  describe('utilisateur', () => {
    it("affiche le nom et l'email de l'utilisateur", () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
      expect(screen.getAllByText('admin@test.com').length).toBeGreaterThan(0);
    });

    it('affiche les initiales si pas d\'image', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('AU').length).toBeGreaterThan(0);
    });

    it("affiche l'image si disponible", () => {
      mockUseSession.mockReturnValue({
        data: {
          user: {
            name: 'Admin User',
            email: 'admin@test.com',
            role: 'admin',
            image: 'https://example.com/avatar.jpg',
          },
        },
        status: 'authenticated',
      });
      render(<Sidebar />);
      const imgs = screen.getAllByAltText('Admin User');
      expect(imgs.length).toBeGreaterThan(0);
      expect(imgs[0]).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('deconnexion', () => {
    it('appelle signOut au clic sur le bouton de deconnexion', () => {
      render(<Sidebar />);
      const buttons = screen.getAllByLabelText('Se déconnecter');
      fireEvent.click(buttons[0]);
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
    });
  });

  describe('mobile', () => {
    it('affiche le bouton hamburger', () => {
      render(<Sidebar />);
      expect(
        screen.getByLabelText('Ouvrir le menu'),
      ).toBeInTheDocument();
    });

    it("ouvre la sidebar mobile au clic sur le bouton hamburger", () => {
      
      render(<Sidebar />);
      const button = screen.getByLabelText('Ouvrir le menu');
      fireEvent.click(button);
      expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();
    });
  });

  describe('accents', () => {
    it('affiche Paramètres avec accent', () => {
      render(<Sidebar />);
      expect(screen.getAllByText('Paramètres').length).toBeGreaterThan(0);
    });

    it('affiche Se déconnecter avec accent', () => {
      render(<Sidebar />);
      const buttons = screen.getAllByLabelText('Se déconnecter');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('tooltips', () => {
    it('affiche des tooltips sur chaque item de navigation', () => {
      render(<Sidebar />);
      // Les tooltips sont des divs avec le meme texte que le label, sans lg:hidden
      const listItems = screen.getAllByRole('listitem');
      listItems.forEach((item) => {
        const tooltip = item.querySelector(
          '.group-hover\\:opacity-100',
        );
        if (tooltip) {
          // Verifie que le tooltip n'a pas la classe lg:hidden
          expect(tooltip.className).not.toContain('lg:hidden');
        }
      });
    });
  });
});
