import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { users, dossiers, dossierDocuments, dossierHistory } from '@/db/schema';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: {
      name: true,
      email: true,
      phone: true,
      role: true,
      image: true,
      notificationPreferences: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable.' },
      { status: 404 },
    );
  }

  // Recuperer les dossiers de l'utilisateur
  const userDossiers = await db.query.dossiers.findMany({
    where: eq(dossiers.userId, session.user.id),
    columns: {
      reference: true,
      nom: true,
      prenom: true,
      email: true,
      telephone: true,
      adresse: true,
      commune: true,
      codePostal: true,
      cadastre: true,
      statut: true,
      etape: true,
      etapeUpdatedAt: true,
      paidAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Recuperer documents et historique pour chaque dossier
  const dossiersWithDetails = await Promise.all(
    userDossiers.map(async (dossier) => {
      // On a besoin de l'id pour les jointures, on le recupere separement
      const dossierRecord = await db.query.dossiers.findFirst({
        where: eq(dossiers.reference, dossier.reference),
        columns: { id: true },
      });

      if (!dossierRecord) return { ...dossier, documents: [], history: [] };

      const documents = await db.query.dossierDocuments.findMany({
        where: eq(dossierDocuments.dossierId, dossierRecord.id),
        columns: {
          type: true,
          label: true,
          received: true,
          receivedAt: true,
        },
      });

      const history = await db.query.dossierHistory.findMany({
        where: eq(dossierHistory.dossierId, dossierRecord.id),
        columns: {
          type: true,
          content: true,
          createdAt: true,
        },
      });

      return { ...dossier, documents, history };
    }),
  );

  const exportData = {
    exportDate: new Date().toISOString(),
    user,
    dossiers: dossiersWithDetails,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="export-donnees-personnelles.json"',
    },
  });
}
