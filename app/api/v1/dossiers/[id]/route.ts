import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { getDossierById, updateDossier, advanceEtape } from '@/lib/dossier';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { id } = await params;
  const dossier = await getDossierById(id);

  if (!dossier) {
    return NextResponse.json(
      { error: 'Dossier introuvable.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: dossier });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  // Si etape est dans le body, on avance l'etape
  if ('etape' in body && typeof body.etape === 'number') {
    try {
      const updated = await advanceEtape(id, body.etape, session.user.id);
      if (!updated) {
        return NextResponse.json(
          { error: 'Dossier introuvable.' },
          { status: 404 },
        );
      }
      return NextResponse.json({ data: updated });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erreur lors du changement d\'etape.';
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  // Sinon, mise a jour des informations
  const allowedFields = [
    'nom',
    'prenom',
    'email',
    'telephone',
    'adresse',
    'commune',
    'codePostal',
    'cadastre',
    'statut',
    'userId',
  ] as const;

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'Aucun champ a mettre a jour.' },
      { status: 400 },
    );
  }

  const updated = await updateDossier(
    id,
    updateData as Parameters<typeof updateDossier>[1],
  );

  if (!updated) {
    return NextResponse.json(
      { error: 'Dossier introuvable.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: updated });
}
