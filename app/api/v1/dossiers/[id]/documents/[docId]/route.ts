import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { toggleDocument } from '@/lib/dossier';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { docId } = await params;

  let body: { received?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  if (typeof body.received !== 'boolean') {
    return NextResponse.json(
      { error: 'Le champ "received" (boolean) est requis.' },
      { status: 400 },
    );
  }

  const updated = await toggleDocument(
    docId,
    body.received,
    session.user.id,
  );

  if (!updated) {
    return NextResponse.json(
      { error: 'Document introuvable.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: updated });
}
