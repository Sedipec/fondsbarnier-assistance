import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../Footer';

describe('Footer', () => {
  it('affiche le texte de copyright', () => {
    render(<Footer />);
    expect(
      screen.getByText('Copyright 2026 SEDIPEC - Tous droits reserves'),
    ).toBeInTheDocument();
  });

  it('affiche un lien vers /about', () => {
    render(<Footer />);
    const link = screen.getByRole('link', { name: 'A propos' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/about');
  });
});
