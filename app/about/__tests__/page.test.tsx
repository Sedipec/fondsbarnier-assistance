import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import AboutPage from '../page';

describe('AboutPage', () => {
  it('affiche le titre de la page', () => {
    render(<AboutPage />);
    expect(
      screen.getByRole('heading', { name: /a propos/i }),
    ).toBeInTheDocument();
  });

  it('affiche le paragraphe de description', () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/accompagner les victimes de sinistres/i),
    ).toBeInTheDocument();
  });

  it("contient un lien retour vers l'accueil", () => {
    render(<AboutPage />);
    const link = screen.getByRole('link', { name: /retour a l'accueil/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
