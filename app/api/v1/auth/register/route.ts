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
        { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 },
      );
    }

    // Verifier si l'email existe deja
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà.' },
        { status: 409 },
      );
    }

    let role: 'admin' | 'client' = 'client';

    // Verifier le token d'invitation admin (operation atomique pour eviter race condition)
    if (inviteToken) {
      const [claimed] = await db
        .update(adminInvitations)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(adminInvitations.token, inviteToken),
            eq(adminInvitations.email, email),
            gt(adminInvitations.expiresAt, new Date()),
            isNull(adminInvitations.usedAt),
          ),
        )
        .returning({ id: adminInvitations.id });

      if (!claimed) {
        return NextResponse.json(
          {
            error: "Lien d'invitation invalide, expiré ou déjà utilisé.",
          },
          { status: 400 },
        );
      }

      role = 'admin';
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
  } catch (error) {
    console.error(
      '[register] Erreur lors de l\'inscription :',
      error instanceof Error ? error.message : 'Unknown error',
    );

    // Contrainte d'unicité violée (email déjà utilisé, race condition)
    if ((error as { code?: string }).code === '23505') {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà.' },
        { status: 409 },
      );
    }

    // Erreur de connexion à la base de données
    if (
      error instanceof Error &&
      (error.message?.includes('connect') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('timeout'))
    ) {
      return NextResponse.json(
        {
          error:
            'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 },
    );
  }
}
