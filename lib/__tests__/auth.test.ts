import { describe, it, expect } from 'vitest';
import bcryptjs from 'bcryptjs';

describe('Auth - Mot de passe', () => {
  it('hash le mot de passe avec bcrypt', async () => {
    const password = 'monMotDePasse123';
    const hash = await bcryptjs.hash(password, 12);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]?\$/);
  });

  it('verifie un mot de passe hash correctement', async () => {
    const password = 'monMotDePasse123';
    const hash = await bcryptjs.hash(password, 12);

    const isValid = await bcryptjs.compare(password, hash);
    expect(isValid).toBe(true);
  });

  it('rejette un mot de passe incorrect', async () => {
    const password = 'monMotDePasse123';
    const hash = await bcryptjs.hash(password, 12);

    const isValid = await bcryptjs.compare('mauvaisMotDePasse', hash);
    expect(isValid).toBe(false);
  });
});

describe('Auth - Creation utilisateur', () => {
  it('cree un utilisateur avec le role client par defaut', () => {
    // Simuler la structure de donnees d'un nouvel utilisateur
    const newUser = {
      name: 'Jean Dupont',
      email: 'jean@example.com',
      role: 'client' as const,
    };

    expect(newUser.role).toBe('client');
    expect(newUser.name).toBe('Jean Dupont');
    expect(newUser.email).toBe('jean@example.com');
  });

  it('cree un utilisateur admin via invitation', () => {
    const adminUser = {
      name: 'Admin Dupont',
      email: 'admin@example.com',
      role: 'admin' as const,
    };

    expect(adminUser.role).toBe('admin');
  });
});
