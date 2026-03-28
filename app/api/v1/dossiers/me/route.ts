import { NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { getDossierByUserId } from '@/lib/dossier';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
  }

  const dossier = await getDossierByUserId(session.user.id);

  if (!dossier) {
    return NextResponse.json(
      { error: 'Aucun dossier trouve.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: dossier });
}
