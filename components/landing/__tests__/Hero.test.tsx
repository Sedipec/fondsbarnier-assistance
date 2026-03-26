import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Hero from '../Hero';

describe('Hero', () => {
  it('affiche le titre principal', () => {
    render(<Hero />);
    expect(screen.getByText(/sinistre inondation/i)).toBeInTheDocument();
  });

  it('affiche le bouton CTA', () => {
    render(<Hero />);
    expect(
      screen.getByRole('link', { name: /commencer ma demande/i }),
    ).toBeInTheDocument();
  });

  it('le bouton CTA pointe vers /demande', () => {
    render(<Hero />);
    const link = screen.getByRole('link', { name: /commencer ma demande/i });
    expect(link).toHaveAttribute('href', '/demande');
  });
});
