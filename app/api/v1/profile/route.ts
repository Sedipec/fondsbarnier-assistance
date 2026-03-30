import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { users, accounts, sessions, dossiers } from '@/db/schema';
import { sendAccountDeletionEmail } from '@/lib/email';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Le nom est requis.').max(100).optional(),
  email: z.string().email('Email invalide.').optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d\s()-]*$/, 'Numéro de téléphone invalide.')
    .nullable()
    .optional(),
  notificationPreferences: z
    .object({
      email: z.boolean(),
      dossierUpdates: z.boolean(),
      newsletter: z.boolean(),
    })
    .optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      notificationPreferences: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: user });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join(' ');
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { name, email, phone, notificationPreferences } = result.data;

  // Verifier unicite email si modification
  if (email && email !== session.user.email) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé.' },
        { status: 409 },
      );
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (notificationPreferences !== undefined)
    updateData.notificationPreferences = notificationPreferences;

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, session.user.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      notificationPreferences: users.notificationPreferences,
    });

  return NextResponse.json({ data: updated });
}

const deleteAccountSchema = z.object({
  confirmation: z.literal('SUPPRIMER MON COMPTE', {
    message: 'Veuillez saisir exactement "SUPPRIMER MON COMPTE" pour confirmer.',
  }),
});

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }

  // Verifier que l'utilisateur est un client (pas un admin)
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable.' },
      { status: 404 },
    );
  }

  if (user.role === 'admin') {
    return NextResponse.json(
      { error: 'Les administrateurs ne peuvent pas supprimer leur compte ici.' },
      { status: 403 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const result = deleteAccountSchema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map((e) => e.message).join(' ');
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // Envoyer l'email de confirmation avant suppression
  const prenom = user.name?.split(' ')[0] || 'Client';
  try {
    await sendAccountDeletionEmail(user.email, prenom);
  } catch {
    // Ne pas bloquer la suppression si l'email echoue
  }

  // Anonymiser les dossiers (preserve les stats business)
  await db
    .update(dossiers)
    .set({
      nom: 'SUPPRIME',
      prenom: 'SUPPRIME',
      email: sql`'supprime-' || ${dossiers.id} || '@anonymise.local'`,
      telephone: null,
      adresse: null,
      userId: null,
      updatedAt: new Date(),
    })
    .where(eq(dossiers.userId, user.id));

  // Supprimer sessions et accounts (cascade depuis users aussi, mais explicite pour clarte)
  await db.delete(sessions).where(eq(sessions.userId, user.id));
  await db.delete(accounts).where(eq(accounts.userId, user.id));

  // Supprimer l'utilisateur
  await db.delete(users).where(eq(users.id, user.id));

  return NextResponse.json({
    data: { message: 'Compte supprime avec succes.' },
  });
}
