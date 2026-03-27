import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { adminInvitations, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendAdminInvitationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json({ error: "L'email est requis." }, { status: 400 });
  }

  // Verifier si l'email existe deja
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return NextResponse.json(
      { error: 'Un utilisateur avec cet email existe deja.' },
      { status: 409 },
    );
  }

  // Generer un token unique
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48h

  // Creer l'invitation
  await db.insert(adminInvitations).values({
    email,
    invitedBy: session.user.id,
    token,
    expiresAt,
  });

  // Envoyer l'email d'invitation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const inviteUrl = `${appUrl}/auth/register?invite=${token}`;

  try {
    await sendAdminInvitationEmail(
      email,
      inviteUrl,
      session.user.name || 'Un administrateur',
    );
  } catch {
    // L'invitation est creee meme si l'email echoue
    return NextResponse.json(
      {
        data: { token, email },
        error:
          "L'invitation a ete creee mais l'email n'a pas pu etre envoye. Lien : " +
          inviteUrl,
      },
      { status: 201 },
    );
  }

  return NextResponse.json({ data: { email, expiresAt } }, { status: 201 });
}
