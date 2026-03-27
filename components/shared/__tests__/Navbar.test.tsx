import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Navbar from '../Navbar';

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

  it('contient un lien vers la page Contact', () => {
    render(<Navbar />);
    const link = screen.getByRole('link', { name: /contact/i });
    expect(link).toHaveAttribute('href', '/contact');
  });

  it("contient un lien vers l'accueil", () => {
    render(<Navbar />);
    const link = screen.getByRole('link', {
      name: /fondsbarnierassistance/i,
    });
    expect(link).toHaveAttribute('href', '/');
  });
});
