import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';

// Schema de validation du profil (miroir de l'API)
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.').max(100).optional(),
  email: z.string().email('Email invalide.').optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d\s()-]*$/, 'Numero de telephone invalide.')
    .nullable()
    .optional(),
  notificationPreferences: z
    .object({
      email: z.boolean(),
      dossierUpdates: z.boolean(),
      newsletter: z.boolean(),
    })
    .optional(),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Le mot de passe actuel est requis.'),
    newPassword: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

describe('Profil - Validation mise a jour', () => {
  it('accepte un nom valide', () => {
    const result = updateProfileSchema.safeParse({ name: 'Jean Dupont' });
    expect(result.success).toBe(true);
  });

  it('rejette un nom vide', () => {
    const result = updateProfileSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('accepte un email valide', () => {
    const result = updateProfileSchema.safeParse({
      email: 'jean@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejette un email invalide', () => {
    const result = updateProfileSchema.safeParse({ email: 'pas-un-email' });
    expect(result.success).toBe(false);
  });

  it('accepte un telephone valide', () => {
    const result = updateProfileSchema.safeParse({
      phone: '+33 6 12 34 56 78',
    });
    expect(result.success).toBe(true);
  });

  it('rejette un telephone avec caracteres speciaux', () => {
    const result = updateProfileSchema.safeParse({
      phone: 'abc123!@#',
    });
    expect(result.success).toBe(false);
  });

  it('accepte phone null pour le supprimer', () => {
    const result = updateProfileSchema.safeParse({ phone: null });
    expect(result.success).toBe(true);
  });

  it('accepte des preferences de notification valides', () => {
    const result = updateProfileSchema.safeParse({
      notificationPreferences: {
        email: true,
        dossierUpdates: false,
        newsletter: true,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejette des preferences de notification incompletes', () => {
    const result = updateProfileSchema.safeParse({
      notificationPreferences: { email: true },
    });
    expect(result.success).toBe(false);
  });
});

describe('Profil - Validation changement mot de passe', () => {
  it('accepte un changement valide', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'ancienMdp123',
      newPassword: 'nouveauMdp456',
      confirmPassword: 'nouveauMdp456',
    });
    expect(result.success).toBe(true);
  });

  it('rejette si mot de passe actuel vide', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'nouveauMdp456',
      confirmPassword: 'nouveauMdp456',
    });
    expect(result.success).toBe(false);
  });

  it('rejette un nouveau mot de passe trop court', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'ancienMdp123',
      newPassword: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejette si confirmation ne correspond pas', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'ancienMdp123',
      newPassword: 'nouveauMdp456',
      confirmPassword: 'autreMdp789',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((e) => e.message);
      expect(messages).toContain('Les mots de passe ne correspondent pas.');
    }
  });

  it('verifie le mot de passe actuel avec bcrypt', async () => {
    const password = 'monMotDePasse123';
    const hash = await bcryptjs.hash(password, 12);

    expect(await bcryptjs.compare(password, hash)).toBe(true);
    expect(await bcryptjs.compare('mauvaisMdp', hash)).toBe(false);
  });

  it('hash le nouveau mot de passe correctement', async () => {
    const newPassword = 'nouveauMdp456';
    const hash = await bcryptjs.hash(newPassword, 12);

    expect(hash).not.toBe(newPassword);
    expect(await bcryptjs.compare(newPassword, hash)).toBe(true);
  });
});
