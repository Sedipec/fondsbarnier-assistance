import { describe, expect, it, vi } from 'vitest';
import { submitContactForm } from '../actions';

// Helper pour creer un FormData avec les champs du formulaire
function createFormData(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

describe('submitContactForm', () => {
  it('retourne une erreur si le nom est vide', async () => {
    const result = await submitContactForm(
      null,
      createFormData({ name: '', email: 'test@example.com', message: 'Hello' }),
    );
    expect(result).toEqual({
      success: false,
      error: 'Le nom est requis.',
    });
  });

  it('retourne une erreur si le nom est manquant', async () => {
    const result = await submitContactForm(
      null,
      createFormData({ email: 'test@example.com', message: 'Hello' }),
    );
    expect(result).toEqual({
      success: false,
      error: 'Le nom est requis.',
    });
  });

  it('retourne une erreur si le nom ne contient que des espaces', async () => {
    const result = await submitContactForm(
      null,
      createFormData({
        name: '   ',
        email: 'test@example.com',
        message: 'Hello',
      }),
    );
    expect(result).toEqual({
      success: false,
      error: 'Le nom est requis.',
    });
  });

  it("retourne une erreur si l'email est vide", async () => {
    const result = await submitContactForm(
      null,
      createFormData({ name: 'Jean', email: '', message: 'Hello' }),
    );
    expect(result).toEqual({
      success: false,
      error: "L'adresse email est requise.",
    });
  });

  it("retourne une erreur si l'email est mal formate", async () => {
    const result = await submitContactForm(
      null,
      createFormData({ name: 'Jean', email: 'invalid', message: 'Hello' }),
    );
    expect(result).toEqual({
      success: false,
      error: "L'adresse email n'est pas valide.",
    });
  });

  it("retourne une erreur si l'email n'a pas de domaine", async () => {
    const result = await submitContactForm(
      null,
      createFormData({ name: 'Jean', email: 'test@', message: 'Hello' }),
    );
    expect(result).toEqual({
      success: false,
      error: "L'adresse email n'est pas valide.",
    });
  });

  it('retourne une erreur si le message est vide', async () => {
    const result = await submitContactForm(
      null,
      createFormData({ name: 'Jean', email: 'test@example.com', message: '' }),
    );
    expect(result).toEqual({
      success: false,
      error: 'Le message est requis.',
    });
  });

  it('retourne une erreur si le message ne contient que des espaces', async () => {
    const result = await submitContactForm(
      null,
      createFormData({
        name: 'Jean',
        email: 'test@example.com',
        message: '   ',
      }),
    );
    expect(result).toEqual({
      success: false,
      error: 'Le message est requis.',
    });
  });

  it('retourne un succes avec des donnees valides', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await submitContactForm(
      null,
      createFormData({
        name: 'Jean Dupont',
        email: 'jean@example.com',
        message: 'Bonjour, je souhaite des informations.',
      }),
    );
    expect(result).toEqual({ success: true });
    expect(consoleSpy).toHaveBeenCalledWith('[Contact] Nouveau message recu');
    consoleSpy.mockRestore();
  });
});
