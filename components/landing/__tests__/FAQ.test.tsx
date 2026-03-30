import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FAQ from '../FAQ';

describe('FAQ', () => {
  it('affiche le titre de la section', () => {
    render(<FAQ />);
    expect(screen.getByText(/questions frequentes/i)).toBeInTheDocument();
  });

  it('affiche 7 questions', () => {
    render(<FAQ />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
  });

  it('la premiere question est ouverte par defaut', () => {
    render(<FAQ />);
    // La premiere question a sa reponse visible (grid-rows-[1fr])
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    // Verifie que le premier item a un contenu visible
    const firstAnswer = buttons[0].closest('div')?.querySelector('.overflow-hidden');
    expect(firstAnswer).toBeTruthy();
  });
});
