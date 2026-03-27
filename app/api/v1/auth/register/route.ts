import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { db } from '@/db';
import { users, adminInvitations } from '@/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, inviteToken } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe sont requis.' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caracteres.' },
        { status: 400 },
      );
    }

    // Verifier si l'email existe deja
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe deja.' },
        { status: 409 },
      );
    }

    let role: 'admin' | 'client' = 'client';

    // Verifier le token d'invitation admin
    if (inviteToken) {
      const invitation = await db.query.adminInvitations.findFirst({
        where: and(
          eq(adminInvitations.token, inviteToken),
          eq(adminInvitations.email, email),
          gt(adminInvitations.expiresAt, new Date()),
          isNull(adminInvitations.usedAt),
        ),
      });

      if (!invitation) {
        return NextResponse.json(
          {
            error: "Lien d'invitation invalide, expire ou deja utilise.",
          },
          { status: 400 },
        );
      }

      role = 'admin';

      // Marquer l'invitation comme utilisee
      await db
        .update(adminInvitations)
        .set({ usedAt: new Date() })
        .where(eq(adminInvitations.id, invitation.id));
    }

    // Hasher le mot de passe
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Creer l'utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 },
    );
  }
}
