import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: 'Email requis.' },
      { status: 400 },
    );
  }

  // Toujours repondre 200 pour ne pas reveler si l'email existe
  const successResponse = NextResponse.json({
    data: { message: 'Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.' },
  });

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return successResponse;

  // Generer un token securise
  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600_000); // 1 heure

  // Stocker dans verification_tokens (table NextAuth existante)
  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.fr';
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  try {
    await sendPasswordResetEmail(email, resetUrl);
  } catch (err) {
    console.error('[forgot-password] Erreur envoi email:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'email.' },
      { status: 500 },
    );
  }

  return successResponse;
}
