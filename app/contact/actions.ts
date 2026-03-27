'use server';

type ContactFormState = {
  success: boolean;
  error?: string;
};

export async function submitContactForm(
  _prevState: ContactFormState | null,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // Validation serveur
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { success: false, error: 'Le nom est requis.' };
  }

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return { success: false, error: "L'adresse email est requise." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { success: false, error: "L'adresse email n'est pas valide." };
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { success: false, error: 'Le message est requis.' };
  }

  // Log du message (pas de DB pour l'instant)
  console.log('[Contact] Nouveau message recu');

  return { success: true };
}
