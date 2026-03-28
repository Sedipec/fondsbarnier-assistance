import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { addNote } from '@/lib/dossier';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { id } = await params;

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  if (!body.content || body.content.trim() === '') {
    return NextResponse.json(
      { error: 'Le champ "content" est requis.' },
      { status: 400 },
    );
  }

  const entry = await addNote(id, body.content.trim(), session.user.id);

  if (!entry) {
    return NextResponse.json(
      { error: 'Dossier introuvable.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: entry }, { status: 201 });
}
