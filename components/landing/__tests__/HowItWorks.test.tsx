import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HowItWorks from '../HowItWorks';

describe('HowItWorks', () => {
  it('affiche le titre de la section', () => {
    render(<HowItWorks />);
    expect(screen.getByText(/comment ca marche/i)).toBeInTheDocument();
  });

  it('affiche les 4 etapes', () => {
    render(<HowItWorks />);
    expect(screen.getByText('Decrivez votre sinistre')).toBeInTheDocument();
    expect(screen.getByText(/Verification d'eligibilite/)).toBeInTheDocument();
    expect(screen.getByText('Constitution du dossier')).toBeInTheDocument();
    expect(screen.getByText('Subvention obtenue')).toBeInTheDocument();
  });
});
