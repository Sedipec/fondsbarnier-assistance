import { NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import {
  dossiers,
  dossierDocuments,
  dossierHistory,
  users,
} from '@/db/schema';
import { eq, count, sql, desc, and, gte } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  // Toutes les requetes en parallele
  const [
    totalDossiers,
    byStatut,
    byEtape,
    docStats,
    recentDossiers,
    recentActivity,
    userStats,
    dossiersThisMonth,
  ] = await Promise.all([
    // Total dossiers
    db.select({ value: count() }).from(dossiers),

    // Repartition par statut
    db
      .select({
        statut: dossiers.statut,
        count: count(),
      })
      .from(dossiers)
      .groupBy(dossiers.statut),

    // Repartition par etape
    db
      .select({
        etape: dossiers.etape,
        count: count(),
      })
      .from(dossiers)
      .where(eq(dossiers.statut, 'actif'))
      .groupBy(dossiers.etape)
      .orderBy(dossiers.etape),

    // Taux completion documents
    db
      .select({
        total: count(),
        received: count(
          sql`CASE WHEN ${dossierDocuments.received} = true THEN 1 END`,
        ),
      })
      .from(dossierDocuments),

    // 5 derniers dossiers
    db
      .select({
        id: dossiers.id,
        reference: dossiers.reference,
        nom: dossiers.nom,
        prenom: dossiers.prenom,
        commune: dossiers.commune,
        etape: dossiers.etape,
        statut: dossiers.statut,
        createdAt: dossiers.createdAt,
      })
      .from(dossiers)
      .orderBy(desc(dossiers.createdAt))
      .limit(5),

    // 10 dernieres actions
    db
      .select({
        id: dossierHistory.id,
        type: dossierHistory.type,
        content: dossierHistory.content,
        createdAt: dossierHistory.createdAt,
        dossierReference: dossiers.reference,
      })
      .from(dossierHistory)
      .leftJoin(dossiers, eq(dossierHistory.dossierId, dossiers.id))
      .orderBy(desc(dossierHistory.createdAt))
      .limit(10),

    // Stats utilisateurs
    db
      .select({
        total: count(),
        admins: count(sql`CASE WHEN ${users.role} = 'admin' THEN 1 END`),
        clients: count(sql`CASE WHEN ${users.role} = 'client' THEN 1 END`),
      })
      .from(users)
      .where(eq(users.isActive, 1)),

    // Dossiers crees ce mois-ci
    db
      .select({ value: count() })
      .from(dossiers)
      .where(
        gte(
          dossiers.createdAt,
          sql`date_trunc('month', CURRENT_DATE)`,
        ),
      ),
  ]);

  const total = totalDossiers[0]?.value ?? 0;
  const docTotal = docStats[0]?.total ?? 0;
  const docReceived = docStats[0]?.received ?? 0;

  return NextResponse.json({
    data: {
      kpis: {
        totalDossiers: total,
        dossiersThisMonth: dossiersThisMonth[0]?.value ?? 0,
        documentCompletionRate:
          docTotal > 0 ? Math.round((docReceived / docTotal) * 100) : 0,
        totalUsers: userStats[0]?.total ?? 0,
        adminCount: userStats[0]?.admins ?? 0,
        clientCount: userStats[0]?.clients ?? 0,
      },
      byStatut: byStatut.reduce(
        (acc, row) => {
          acc[row.statut] = row.count;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byEtape,
      recentDossiers,
      recentActivity,
    },
  });
}
