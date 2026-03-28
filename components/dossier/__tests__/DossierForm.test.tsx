import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DossierForm from '../DossierForm';

const mockSources = [
  { id: 'src-1', slug: 'mairie', label: 'Mairie' },
  { id: 'src-2', slug: 'web', label: 'Site web' },
];

describe('DossierForm', () => {
  const defaultProps = {
    sources: mockSources,
    onSubmit: vi.fn(),
  };

  describe('affichage de base', () => {
    it('affiche les champs obligatoires', () => {
      render(<DossierForm {...defaultProps} />);
      expect(screen.getByLabelText('Nom *')).toBeInTheDocument();
      expect(screen.getByLabelText('Prenom *')).toBeInTheDocument();
      expect(screen.getByLabelText('Email *')).toBeInTheDocument();
    });

    it('affiche le select source avec les options', () => {
      render(<DossierForm {...defaultProps} />);
      expect(screen.getByLabelText('Source *')).toBeInTheDocument();
      expect(screen.getByText('Mairie')).toBeInTheDocument();
      expect(screen.getByText('Site web')).toBeInTheDocument();
    });

    it('affiche le bouton "Creer le dossier" en mode creation', () => {
      render(<DossierForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: 'Creer le dossier' }),
      ).toBeInTheDocument();
    });

    it('affiche le bouton "Enregistrer" en mode edition', () => {
      render(
        <DossierForm
          {...defaultProps}
          dossier={{ nom: 'Dupont', prenom: 'Jean', email: 'j@d.fr' }}
        />,
      );
      expect(
        screen.getByRole('button', { name: 'Enregistrer' }),
      ).toBeInTheDocument();
    });
  });

  describe('etat loading des sources', () => {
    it('affiche le spinner quand sourcesLoading est vrai', () => {
      render(
        <DossierForm {...defaultProps} sources={[]} sourcesLoading={true} />,
      );
      expect(screen.getByText('Chargement des sources...')).toBeInTheDocument();
      expect(screen.queryByLabelText('Source *')).not.toBeInTheDocument();
    });

    it('desactive le submit quand loading est vrai', () => {
      render(<DossierForm {...defaultProps} loading={true} />);
      expect(screen.getByRole('button', { name: '' })).toBeDisabled();
    });
  });

  describe('etat erreur des sources', () => {
    it("affiche le message d'erreur quand sourcesError est defini", () => {
      render(
        <DossierForm
          {...defaultProps}
          sources={[]}
          sourcesError="Erreur de chargement"
        />,
      );
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
      expect(screen.queryByLabelText('Source *')).not.toBeInTheDocument();
    });

    it('affiche le bouton Réessayer quand onRetrySources est fourni', () => {
      const onRetry = vi.fn();
      render(
        <DossierForm
          {...defaultProps}
          sources={[]}
          sourcesError="Erreur"
          onRetrySources={onRetry}
        />,
      );
      const retryBtn = screen.getByRole('button', { name: 'Réessayer' });
      expect(retryBtn).toBeInTheDocument();
    });

    it('appelle onRetrySources au clic sur Réessayer', () => {
      const onRetry = vi.fn();
      render(
        <DossierForm
          {...defaultProps}
          sources={[]}
          sourcesError="Erreur"
          onRetrySources={onRetry}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
      expect(onRetry).toHaveBeenCalledOnce();
    });

    it('ne montre pas le bouton Réessayer sans onRetrySources', () => {
      render(
        <DossierForm {...defaultProps} sources={[]} sourcesError="Erreur" />,
      );
      expect(
        screen.queryByRole('button', { name: 'Réessayer' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('sources vides (aucune source en base)', () => {
    it('affiche un message quand sources est vide sans erreur ni chargement', () => {
      render(<DossierForm {...defaultProps} sources={[]} />);
      expect(screen.getByText('Aucune source disponible.')).toBeInTheDocument();
      expect(screen.queryByLabelText('Source *')).not.toBeInTheDocument();
    });

    it('affiche le bouton Réessayer quand sources est vide et onRetrySources fourni', () => {
      const onRetry = vi.fn();
      render(
        <DossierForm {...defaultProps} sources={[]} onRetrySources={onRetry} />,
      );
      expect(screen.getByText('Aucune source disponible.')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Réessayer' }));
      expect(onRetry).toHaveBeenCalledOnce();
    });
  });

  describe('synchronisation sourceId via useEffect', () => {
    it('selectionne la premiere source quand les sources arrivent apres le montage', async () => {
      const { rerender } = render(
        <DossierForm {...defaultProps} sources={[]} onSubmit={vi.fn()} />,
      );
      // Simuler l'arrivee des sources
      rerender(
        <DossierForm
          {...defaultProps}
          sources={mockSources}
          onSubmit={vi.fn()}
        />,
      );
      await waitFor(() => {
        const select = screen.getByLabelText('Source *') as HTMLSelectElement;
        expect(select.value).toBe('src-1');
      });
    });

    it('ne modifie pas sourceId si un dossier est fourni', () => {
      render(
        <DossierForm
          {...defaultProps}
          dossier={{
            nom: 'Dupont',
            prenom: 'Jean',
            email: 'j@d.fr',
            sourceId: 'src-2',
          }}
        />,
      );
      // En mode edition, le select source n'est pas affiche
      expect(screen.queryByLabelText('Source *')).not.toBeInTheDocument();
    });
  });

  describe('soumission du formulaire', () => {
    it('appelle onSubmit avec les donnees du formulaire', () => {
      const onSubmit = vi.fn();
      render(<DossierForm {...defaultProps} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Nom *'), {
        target: { value: 'Dupont', name: 'nom' },
      });
      fireEvent.change(screen.getByLabelText('Prenom *'), {
        target: { value: 'Jean', name: 'prenom' },
      });
      fireEvent.change(screen.getByLabelText('Email *'), {
        target: { value: 'jean@dupont.fr', name: 'email' },
      });

      fireEvent.submit(
        screen.getByRole('button', { name: 'Creer le dossier' }),
      );

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean@dupont.fr',
          sourceId: 'src-1',
        }),
      );
    });
  });
});
