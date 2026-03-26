import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FAQ from '../FAQ';

describe('FAQ', () => {
  it('affiche le titre de la section', () => {
    render(<FAQ />);
    expect(screen.getByText(/questions frequentes/i)).toBeInTheDocument();
  });

  it('affiche 5 questions', () => {
    render(<FAQ />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(5);
  });

  it('la premiere question est ouverte par defaut', () => {
    render(<FAQ />);
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
  });
});
