import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { createDossier, listDossiers } from '@/lib/dossier';

const REQUIRED_FIELDS = ['nom', 'prenom', 'email', 'sourceId'] as const;

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const etape = searchParams.get('etape');
  const statut = searchParams.get('statut');
  const search = searchParams.get('search');
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const result = await listDossiers({
    etape: etape ? Number(etape) : undefined,
    statut: statut || undefined,
    search: search || undefined,
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 20,
  });

  return NextResponse.json({ data: result.data, count: result.count });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
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

  // Client : on associe automatiquement son userId
  const userId =
    session.user.role === 'admin'
      ? body.userId
        ? String(body.userId)
        : null
      : session.user.id;

  let result;
  try {
    result = await createDossier({
      nom: String(body.nom),
      prenom: String(body.prenom),
      email: emailStr,
      telephone: body.telephone ? String(body.telephone) : null,
      commune: body.commune ? String(body.commune) : null,
      adresse: body.adresse ? String(body.adresse) : null,
      codePostal: body.codePostal ? String(body.codePostal) : null,
      cadastre: body.cadastre ? String(body.cadastre) : null,
      sourceId: String(body.sourceId),
      userId,
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur interne lors de la creation du dossier.' },
      { status: 500 },
    );
  }

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
