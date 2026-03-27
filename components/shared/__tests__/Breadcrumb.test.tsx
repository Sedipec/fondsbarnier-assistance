import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Breadcrumb from '../Breadcrumb';

// Mock next/navigation
const mockUsePathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('Breadcrumb', () => {
  it('ne rend rien pour la racine', () => {
    mockUsePathname.mockReturnValue('/');
    const { container } = render(<Breadcrumb />);
    expect(container.querySelector('nav')).not.toBeInTheDocument();
  });

  it('affiche un seul segment sans lien', () => {
    mockUsePathname.mockReturnValue('/admin');
    render(<Breadcrumb />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
    // Le dernier segment n'est pas un lien
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('affiche deux segments avec lien sur le premier', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
    render(<Breadcrumb />);
    const link = screen.getByRole('link', { name: 'Admin' });
    expect(link).toHaveAttribute('href', '/admin');
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
  });

  it('affiche trois segments avec liens sur les deux premiers', () => {
    mockUsePathname.mockReturnValue('/admin/dossiers/123');
    render(<Breadcrumb />);
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute(
      'href',
      '/admin',
    );
    expect(screen.getByRole('link', { name: 'Dossiers' })).toHaveAttribute(
      'href',
      '/admin/dossiers',
    );
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('traduit les segments connus en labels francais', () => {
    mockUsePathname.mockReturnValue('/espace/mon-dossier');
    render(<Breadcrumb />);
    expect(
      screen.getByRole('link', { name: 'Mon espace' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Mon dossier')).toBeInTheDocument();
  });

  it('affiche Paramètres avec accent', () => {
    mockUsePathname.mockReturnValue('/admin/parametres');
    render(<Breadcrumb />);
    expect(screen.getByText('Paramètres')).toBeInTheDocument();
  });

  it('affiche des separateurs entre les segments', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
    render(<Breadcrumb />);
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('a le role navigation avec le label Fil d\'ariane', () => {
    mockUsePathname.mockReturnValue('/admin/dashboard');
    render(<Breadcrumb />);
    expect(
      screen.getByRole('navigation', { name: "Fil d'ariane" }),
    ).toBeInTheDocument();
  });
});
