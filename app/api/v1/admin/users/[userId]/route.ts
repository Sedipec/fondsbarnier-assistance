import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Desactiver / activer un utilisateur
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

  // Validate isActive: must be 0 or 1
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

  await db
    .update(users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return NextResponse.json({ data: { id: userId, isActive } });
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
