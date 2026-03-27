import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ContactPage from '../page';

// Mock useActionState de React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useActionState: vi.fn(() => [null, vi.fn(), false]),
  };
});

describe('ContactPage', () => {
  it('affiche le titre Contact', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('heading', { name: /contact/i }),
    ).toBeInTheDocument();
  });

  it('affiche les champs nom, email et message', () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/nom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('affiche le bouton Envoyer', () => {
    render(<ContactPage />);
    expect(
      screen.getByRole('button', { name: /envoyer/i }),
    ).toBeInTheDocument();
  });

  it('les champs sont requis', () => {
    render(<ContactPage />);
    expect(screen.getByLabelText(/nom/i)).toBeRequired();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    expect(screen.getByLabelText(/message/i)).toBeRequired();
  });

  it('desactive le formulaire en mode loading', async () => {
    const react = await import('react');
    vi.mocked(react.useActionState).mockReturnValue([
      null,
      vi.fn(),
      true,
    ]);

    render(<ContactPage />);
    expect(screen.getByLabelText(/nom/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/message/i)).toBeDisabled();
  });

  it('affiche un toast de succes apres envoi', async () => {
    const react = await import('react');
    vi.mocked(react.useActionState).mockReturnValue([
      { success: true },
      vi.fn(),
      false,
    ]);

    render(<ContactPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Votre message a bien ete envoye',
    );
  });

  it("affiche un toast d'erreur en cas d'echec", async () => {
    const react = await import('react');
    vi.mocked(react.useActionState).mockReturnValue([
      { success: false, error: 'Le nom est requis.' },
      vi.fn(),
      false,
    ]);

    render(<ContactPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Le nom est requis.',
    );
  });
});
