import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Testimonials from '../Testimonials';

describe('Testimonials', () => {
  it('affiche le titre de la section', () => {
    render(<Testimonials />);
    expect(screen.getByText(/ils nous font confiance/i)).toBeInTheDocument();
  });

  it('affiche 3 temoignages', () => {
    render(<Testimonials />);
    expect(screen.getByText('Marie L.')).toBeInTheDocument();
    expect(screen.getByText('Jean-Pierre D.')).toBeInTheDocument();
    expect(screen.getByText('Sophie M.')).toBeInTheDocument();
  });

  it('affiche les villes des temoins', () => {
    render(<Testimonials />);
    expect(screen.getByText('Nemours (77)')).toBeInTheDocument();
    expect(screen.getByText('Lourdes (65)')).toBeInTheDocument();
    expect(screen.getByText('Vaison-la-Romaine (84)')).toBeInTheDocument();
  });
});
