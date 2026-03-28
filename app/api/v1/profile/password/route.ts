import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { users } from '@/db/schema';

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Le mot de passe actuel est requis.'),
    newPassword: z
      .string()
      .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas.',
    path: ['confirmPassword'],
  });

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const result = changePasswordSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(' ');
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { currentPassword, newPassword } = result.data;

  // Recuperer le hash actuel
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { password: true },
  });

  if (!user?.password) {
    return NextResponse.json(
      {
        error:
          'Changement de mot de passe non disponible pour les comptes OAuth.',
      },
      { status: 400 },
    );
  }

  const isValid = await bcryptjs.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json(
      { error: 'Le mot de passe actuel est incorrect.' },
      { status: 400 },
    );
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 12);

  await db
    .update(users)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json({
    data: { message: 'Mot de passe modifie avec succes.' },
  });
}
