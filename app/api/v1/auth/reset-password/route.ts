import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  let body: { email?: string; token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  const token = body.token?.trim();
  const password = body.password;

  if (!email || !token || !password) {
    return NextResponse.json(
      { error: 'Email, token et mot de passe requis.' },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Le mot de passe doit contenir au moins 8 caracteres.' },
      { status: 400 },
    );
  }

  // Verifier le token
  const [storedToken] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    )
    .limit(1);

  if (!storedToken) {
    return NextResponse.json(
      { error: 'Lien de reinitialisation invalide ou expire.' },
      { status: 400 },
    );
  }

  if (storedToken.expires < new Date()) {
    // Supprimer le token expire
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, email),
          eq(verificationTokens.token, token),
        ),
      );
    return NextResponse.json(
      { error: 'Ce lien a expire. Veuillez refaire une demande.' },
      { status: 400 },
    );
  }

  // Mettre a jour le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.email, email));

  // Supprimer le token utilise
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
      ),
    );

  return NextResponse.json({
    data: { message: 'Mot de passe mis a jour avec succes.' },
  });
}
