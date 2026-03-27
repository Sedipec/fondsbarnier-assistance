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
  const body = await request.json();

  // Empecher un admin de se desactiver lui-meme
  if (userId === session.user.id && body.isActive === 0) {
    return NextResponse.json(
      { error: 'Vous ne pouvez pas desactiver votre propre compte.' },
      { status: 400 },
    );
  }

  await db
    .update(users)
    .set({
      isActive: body.isActive,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return NextResponse.json({ data: { id: userId, isActive: body.isActive } });
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
