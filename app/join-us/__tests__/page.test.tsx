import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import JoinUsPage from '../page';

describe('JoinUsPage', () => {
  it('affiche le titre de la page', () => {
    render(<JoinUsPage />);
    expect(
      screen.getByRole('heading', { name: /pourquoi nous rejoindre/i }),
    ).toBeInTheDocument();
  });

  it('affiche le paragraphe de description', () => {
    render(<JoinUsPage />);
    expect(
      screen.getByText(/accompagnement personnalise/i),
    ).toBeInTheDocument();
  });

  it("contient un lien retour vers l'accueil", () => {
    render(<JoinUsPage />);
    const link = screen.getByRole('link', { name: /retour a l'accueil/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
