import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { dossiers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  const { id } = await params;

  const [dossier] = await db
    .select({
      id: dossiers.id,
      userId: dossiers.userId,
      invoiceUrl: dossiers.invoiceUrl,
      paidAt: dossiers.paidAt,
    })
    .from(dossiers)
    .where(eq(dossiers.id, id))
    .limit(1);

  if (!dossier) {
    return NextResponse.json(
      { error: 'Dossier introuvable.' },
      { status: 404 },
    );
  }

  // Verifier que c'est le proprietaire ou un admin
  const role = (session.user as { role?: string }).role;
  if (role !== 'admin' && dossier.userId !== session.user.id) {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  if (!dossier.paidAt || !dossier.invoiceUrl) {
    return NextResponse.json(
      { error: 'Aucune facture disponible pour ce dossier.' },
      { status: 404 },
    );
  }

  return NextResponse.redirect(dossier.invoiceUrl);
}
