import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DossierTable from '../DossierTable';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock EtapeBadge
vi.mock('../EtapeBadge', () => ({
  default: ({ etape, statut }: { etape: number; statut: string }) => (
    <span data-testid="etape-badge">
      {etape}/{statut}
    </span>
  ),
}));

const mockDossiers = [
  {
    id: '1',
    reference: 'FBA-2026-001',
    nom: 'Dupont',
    prenom: 'Jean',
    commune: 'Lyon',
    etape: 3,
    statut: 'actif',
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    reference: 'FBA-2026-002',
    nom: 'Martin',
    prenom: 'Marie',
    commune: null,
    etape: 5,
    statut: 'suspendu',
    createdAt: '2026-02-20T00:00:00.000Z',
  },
];

describe('DossierTable', () => {
  const defaultProps = {
    dossiers: mockDossiers,
    page: 1,
    totalCount: 2,
    limit: 20,
    onPageChange: vi.fn(),
  };

  describe('affichage des dossiers', () => {
    it('affiche les references des dossiers', () => {
      render(<DossierTable {...defaultProps} />);
      expect(screen.getAllByText('FBA-2026-001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('FBA-2026-002').length).toBeGreaterThan(0);
    });

    it('affiche les noms des clients', () => {
      render(<DossierTable {...defaultProps} />);
      expect(screen.getAllByText('Dupont Jean').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Martin Marie').length).toBeGreaterThan(0);
    });

    it('affiche la commune ou un tiret si null', () => {
      render(<DossierTable {...defaultProps} />);
      expect(screen.getAllByText('Lyon').length).toBeGreaterThan(0);
      expect(screen.getAllByText('-').length).toBeGreaterThan(0);
    });
  });

  describe('etat vide', () => {
    it('affiche un message quand il n\'y a pas de dossiers (mobile et desktop)', () => {
      render(
        <DossierTable
          {...defaultProps}
          dossiers={[]}
          totalCount={0}
        />,
      );
      const messages = screen.getAllByText('Aucun dossier trouvé.');
      expect(messages.length).toBe(2);
    });
  });

  describe('navigation', () => {
    it('redirige vers le dossier au clic sur une ligne desktop', () => {
      render(<DossierTable {...defaultProps} />);
      const rows = screen.getAllByText('FBA-2026-001');
      // Cliquer sur la ligne desktop (dans la table)
      const tableRow = rows[0].closest('tr');
      if (tableRow) {
        fireEvent.click(tableRow);
        expect(mockPush).toHaveBeenCalledWith('/admin/dossiers/1');
      }
    });

    it('redirige vers le dossier au clic sur une card mobile', () => {
      mockPush.mockClear();
      render(<DossierTable {...defaultProps} />);
      // La card mobile contient la reference dans un span
      const mobileCards = screen
        .getAllByText('FBA-2026-001')
        .map((el) => el.closest('[class*="cursor-pointer"]'))
        .filter(Boolean);
      if (mobileCards[0]) {
        fireEvent.click(mobileCards[0]);
        expect(mockPush).toHaveBeenCalledWith('/admin/dossiers/1');
      }
    });
  });

  describe('pagination', () => {
    it("n'affiche pas la pagination si une seule page", () => {
      render(<DossierTable {...defaultProps} />);
      expect(screen.queryByText('Précédent')).not.toBeInTheDocument();
      expect(screen.queryByText('Suivant')).not.toBeInTheDocument();
    });

    it('affiche la pagination si plusieurs pages', () => {
      render(
        <DossierTable {...defaultProps} totalCount={50} limit={20} />,
      );
      expect(screen.getByText('Précédent')).toBeInTheDocument();
      expect(screen.getByText('Suivant')).toBeInTheDocument();
      expect(screen.getByText('Page 1 / 3')).toBeInTheDocument();
    });

    it('desactive le bouton Precedent sur la premiere page', () => {
      render(
        <DossierTable {...defaultProps} totalCount={50} page={1} />,
      );
      expect(screen.getByText('Précédent')).toBeDisabled();
    });

    it('desactive le bouton Suivant sur la derniere page', () => {
      render(
        <DossierTable
          {...defaultProps}
          totalCount={50}
          limit={20}
          page={3}
        />,
      );
      expect(screen.getByText('Suivant')).toBeDisabled();
    });

    it('appelle onPageChange au clic sur Suivant', () => {
      const onPageChange = vi.fn();
      render(
        <DossierTable
          {...defaultProps}
          totalCount={50}
          onPageChange={onPageChange}
        />,
      );
      fireEvent.click(screen.getByText('Suivant'));
      expect(onPageChange).toHaveBeenCalledWith(2);
    });

    it('appelle onPageChange au clic sur Precedent', () => {
      const onPageChange = vi.fn();
      render(
        <DossierTable
          {...defaultProps}
          totalCount={50}
          page={2}
          onPageChange={onPageChange}
        />,
      );
      fireEvent.click(screen.getByText('Précédent'));
      expect(onPageChange).toHaveBeenCalledWith(1);
    });
  });
});
