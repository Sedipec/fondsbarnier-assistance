import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { dossierDocuments, dossiers, dossierHistory } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 Mo
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Formulaire invalide.' },
      { status: 400 },
    );
  }

  const file = formData.get('file') as File | null;
  const documentId = formData.get('documentId') as string | null;

  if (!file || !documentId) {
    return NextResponse.json(
      { error: 'Fichier et documentId requis.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Fichier trop volumineux (max 10 Mo).' },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Type de fichier non autorise (PDF, JPG, PNG uniquement).' },
      { status: 400 },
    );
  }

  // Verifier que le document existe et appartient au client
  const [doc] = await db
    .select({
      id: dossierDocuments.id,
      dossierId: dossierDocuments.dossierId,
      label: dossierDocuments.label,
    })
    .from(dossierDocuments)
    .where(eq(dossierDocuments.id, documentId))
    .limit(1);

  if (!doc) {
    return NextResponse.json(
      { error: 'Document introuvable.' },
      { status: 404 },
    );
  }

  // Verifier que le dossier appartient au client (sauf admin)
  const role = (session.user as { role?: string }).role;
  if (role !== 'admin') {
    const [dossier] = await db
      .select({ userId: dossiers.userId })
      .from(dossiers)
      .where(eq(dossiers.id, doc.dossierId))
      .limit(1);

    if (!dossier || dossier.userId !== session.user.id) {
      return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
    }
  }

  // Generer un nom de fichier unique
  const ext = path.extname(file.name) || '.pdf';
  const filename = `${doc.dossierId}/${crypto.randomUUID()}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // Ecrire le fichier
  try {
    await mkdir(path.dirname(filepath), { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);
  } catch (err) {
    console.error('[upload] Erreur ecriture fichier:', err);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du fichier.' },
      { status: 500 },
    );
  }

  // Mettre a jour le document en base
  const now = new Date();
  await db
    .update(dossierDocuments)
    .set({
      fileUrl: `/api/v1/documents/file/${filename}`,
      received: true,
      receivedAt: now,
    })
    .where(eq(dossierDocuments.id, documentId));

  // Ajouter l'historique
  await db.insert(dossierHistory).values({
    dossierId: doc.dossierId,
    type: 'document',
    content: `Document "${doc.label}" televerse par le client`,
    authorId: session.user.id,
  });

  return NextResponse.json({
    data: { documentId, filename, received: true },
  });
}
