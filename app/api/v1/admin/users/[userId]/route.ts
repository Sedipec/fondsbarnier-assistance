import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Modifier un utilisateur (activation/desactivation + role)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { userId } = await params;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const updateData: {
    isActive?: number;
    role?: 'admin' | 'client';
    updatedAt: Date;
  } = {
    updatedAt: new Date(),
  };

  // Gestion isActive
  if (body.isActive !== undefined) {
    const isActive = Number(body.isActive);
    if (isActive !== 0 && isActive !== 1) {
      return NextResponse.json(
        { error: 'Valeur isActive invalide (0 ou 1 attendu).' },
        { status: 400 },
      );
    }

    // Empecher un admin de se desactiver lui-meme
    if (userId === session.user.id && isActive === 0) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas desactiver votre propre compte.' },
        { status: 400 },
      );
    }

    updateData.isActive = isActive;
  }

  // Gestion du role
  if (body.role !== undefined) {
    if (body.role !== 'admin' && body.role !== 'client') {
      return NextResponse.json(
        { error: 'Role invalide (admin ou client attendu).' },
        { status: 400 },
      );
    }

    // Empecher un admin de changer son propre role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre role.' },
        { status: 400 },
      );
    }

    updateData.role = body.role;
  }

  // Pas de champ à mettre à jour
  if (updateData.isActive === undefined && updateData.role === undefined) {
    return NextResponse.json(
      { error: 'Aucun champ à modifier (isActive ou role attendu).' },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      updatedAt: users.updatedAt,
    });

  return NextResponse.json({ data: updated });
}

// Supprimer un utilisateur
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { userId } = await params;

  // Empecher un admin de se supprimer lui-meme
  if (userId === session.user.id) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas supprimer votre propre compte.' },
      { status: 400 },
    );
  }

  await db.delete(users).where(eq(users.id, userId));

  return NextResponse.json({ data: { id: userId, deleted: true } });
}
