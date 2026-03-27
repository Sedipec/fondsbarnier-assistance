import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { createDossier } from '@/lib/dossier';

const REQUIRED_FIELDS = [
  'nom',
  'prenom',
  'email',
  'telephone',
  'commune',
  'typeDeBien',
  'sourceId',
] as const;

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  // Validation des champs requis
  for (const field of REQUIRED_FIELDS) {
    const value = body[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return NextResponse.json(
        { error: `Le champ "${field}" est requis.` },
        { status: 400 },
      );
    }
  }

  // Validation format email basique
  const emailStr = String(body.email);
  if (!emailStr.includes('@') || !emailStr.includes('.')) {
    return NextResponse.json(
      { error: 'Format email invalide.' },
      { status: 400 },
    );
  }

  const result = await createDossier({
    nom: String(body.nom),
    prenom: String(body.prenom),
    email: emailStr,
    telephone: String(body.telephone),
    commune: String(body.commune),
    typeDeBien: String(body.typeDeBien),
    sourceId: String(body.sourceId),
    adresseComplete: body.adresseComplete ? String(body.adresseComplete) : null,
    numeroCadastre: body.numeroCadastre ? String(body.numeroCadastre) : null,
    gestionnaireId: body.gestionnaireId ? String(body.gestionnaireId) : null,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const response: { data: typeof result.dossier; warning?: string } = {
    data: result.dossier,
  };

  if (result.warning) {
    response.warning = result.warning;
  }

  return NextResponse.json(response, { status: 201 });
}
