import { describe, it, expect } from 'vitest';

interface Invitation {
  id: string;
  email: string;
  token: string;
  expiresAt: Date;
  usedAt: Date | null;
}

// Fonction utilitaire pour valider un token d'invitation
function validateInvitationToken(invitation: Invitation | null): {
  valid: boolean;
  error?: string;
} {
  if (!invitation) {
    return { valid: false, error: 'Invitation introuvable.' };
  }

  if (invitation.usedAt) {
    return { valid: false, error: 'Invitation deja utilisee.' };
  }

  if (invitation.expiresAt < new Date()) {
    return { valid: false, error: 'Invitation expiree.' };
  }

  return { valid: true };
}

describe('Invitation - Validation token', () => {
  it('valide un token valide', () => {
    const invitation: Invitation = {
      id: '1',
      email: 'test@example.com',
      token: 'valid-token',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h dans le futur
      usedAt: null,
    };

    const result = validateInvitationToken(invitation);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejette un token expire', () => {
    const invitation: Invitation = {
      id: '2',
      email: 'test@example.com',
      token: 'expired-token',
      expiresAt: new Date(Date.now() - 1000), // Expire
      usedAt: null,
    };

    const result = validateInvitationToken(invitation);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invitation expiree.');
  });

  it('rejette un token deja utilise', () => {
    const invitation: Invitation = {
      id: '3',
      email: 'test@example.com',
      token: 'used-token',
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      usedAt: new Date(), // Deja utilise
    };

    const result = validateInvitationToken(invitation);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invitation deja utilisee.');
  });

  it('rejette un token introuvable', () => {
    const result = validateInvitationToken(null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invitation introuvable.');
  });
});
