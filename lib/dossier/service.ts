import { db } from '@/db';
import {
  dossiers,
  dossierDocuments,
  dossierHistory,
  sources,
} from '@/db/schema';
import { eq, and, sql, ilike, or, desc, asc, count } from 'drizzle-orm';

// Types de documents par defaut crees a la creation d'un dossier
const DEFAULT_DOCUMENTS = [
  { type: 'assurance' as const, label: 'Attestation assurance habitation' },
  { type: 'cadastre' as const, label: 'Releve cadastral' },
  { type: 'rib' as const, label: 'RIB' },
  { type: 'devis' as const, label: 'Devis de travaux' },
  { type: 'diagnostic' as const, label: 'Diagnostic inondation' },
  { type: 'valeur_venale' as const, label: 'Estimation valeur venale' },
];

export type CreateDossierInput = {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  commune?: string | null;
  codePostal?: string | null;
  cadastre?: string | null;
  sourceId: string;
  userId?: string | null;
};

export type CreateDossierResult = {
  success: boolean;
  dossier?: typeof dossiers.$inferSelect;
  error?: string;
  warning?: string;
};

/**
 * Normalise l'email : lowercase + trim
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Genere une reference thread-safe FB-AAAA-NNNN via transaction DB.
 * Utilise un advisory lock pour serialiser la generation de references.
 */
async function generateReference(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FB-${year}-`;

  await tx.execute(sql`SELECT pg_advisory_xact_lock(${year})`);

  const result = await tx.execute(sql`
    SELECT COUNT(*) as count
    FROM dossiers
    WHERE reference LIKE ${prefix + '%'}
  `);

  const cnt = Number(result[0]?.count ?? 0);
  const next = cnt + 1;

  if (next > 9999) {
    throw new Error(
      'Limite de 9999 dossiers par an atteinte. Contactez un administrateur.',
    );
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
}

/**
 * Cree un dossier avec deduplication et generation de reference thread-safe.
 */
export async function createDossier(
  input: CreateDossierInput,
): Promise<CreateDossierResult> {
  const email = normalizeEmail(input.email);

  // Verifier que la source existe
  const [source] = await db
    .select()
    .from(sources)
    .where(eq(sources.id, input.sourceId))
    .limit(1);

  if (!source) {
    return { success: false, error: 'Source invalide' };
  }

  try {
    const result = await db.transaction(async (tx) => {
      // Dedup primaire : unicite email
      const [existingByEmail] = await tx
        .select({ reference: dossiers.reference })
        .from(dossiers)
        .where(eq(dossiers.email, email))
        .limit(1);

      if (existingByEmail) {
        return {
          success: false as const,
          error: `Un dossier existe deja avec cet email (${existingByEmail.reference}).`,
        };
      }

      // Dedup secondaire : telephone + nom + commune (warning)
      let warning: string | undefined;
      if (input.telephone && input.commune) {
        const [similarDossier] = await tx
          .select({ reference: dossiers.reference })
          .from(dossiers)
          .where(
            and(
              eq(
                sql`lower(${dossiers.telephone})`,
                input.telephone.trim().toLowerCase(),
              ),
              eq(
                sql`lower(${dossiers.nom})`,
                input.nom.trim().toLowerCase(),
              ),
              eq(
                sql`lower(${dossiers.commune})`,
                input.commune.trim().toLowerCase(),
              ),
            ),
          )
          .limit(1);

        if (similarDossier) {
          warning = `Dossier potentiellement similaire — #${similarDossier.reference} — Verifiez avant de continuer`;
        }
      }

      // Generation de reference et insertion
      const reference = await generateReference(tx);

      const [created] = await tx
        .insert(dossiers)
        .values({
          nom: input.nom.trim(),
          prenom: input.prenom.trim(),
          email,
          telephone: input.telephone?.trim() ?? null,
          adresse: input.adresse?.trim() ?? null,
          commune: input.commune?.trim() ?? null,
          codePostal: input.codePostal?.trim() ?? null,
          cadastre: input.cadastre?.trim() ?? null,
          reference,
          sourceId: input.sourceId,
          userId: input.userId ?? null,
        })
        .returning();

      // Creer les documents par defaut
      await tx.insert(dossierDocuments).values(
        DEFAULT_DOCUMENTS.map((doc) => ({
          dossierId: created.id,
          type: doc.type,
          label: doc.label,
        })),
      );

      // Creer l'entree historique de creation
      await tx.insert(dossierHistory).values({
        dossierId: created.id,
        type: 'creation',
        content: `Dossier ${reference} cree`,
        authorId: input.userId ?? null,
      });

      return { success: true as const, dossier: created, warning };
    });

    return result;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === '23505' &&
      error.message.includes('email')
    ) {
      return {
        success: false,
        error: 'Un dossier avec cet email existe deja.',
      };
    }
    throw error;
  }
}

/**
 * Recupere un dossier par ID avec documents et historique.
 */
export async function getDossierById(id: string) {
  const [dossier] = await db
    .select()
    .from(dossiers)
    .where(eq(dossiers.id, id))
    .limit(1);

  if (!dossier) return null;

  const documents = await db
    .select()
    .from(dossierDocuments)
    .where(eq(dossierDocuments.dossierId, id));

  const history = await db
    .select()
    .from(dossierHistory)
    .where(eq(dossierHistory.dossierId, id))
    .orderBy(desc(dossierHistory.createdAt));

  return { ...dossier, documents, history };
}

/**
 * Recupere le dossier d'un client par userId.
 */
export async function getDossierByUserId(userId: string) {
  const [dossier] = await db
    .select()
    .from(dossiers)
    .where(eq(dossiers.userId, userId))
    .limit(1);

  if (!dossier) return null;

  return getDossierById(dossier.id);
}

/**
 * Liste les dossiers avec filtres et pagination (admin).
 */
export async function listDossiers(params: {
  etape?: number;
  statut?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { etape, statut, search, page = 1, limit = 20 } = params;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (etape) {
    conditions.push(eq(dossiers.etape, etape));
  }

  if (
    statut &&
    ['actif', 'suspendu', 'clos', 'non_eligible'].includes(statut)
  ) {
    conditions.push(
      eq(
        dossiers.statut,
        statut as 'actif' | 'suspendu' | 'clos' | 'non_eligible',
      ),
    );
  }

  if (search) {
    const searchTerm = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        ilike(dossiers.nom, searchTerm),
        ilike(dossiers.prenom, searchTerm),
        ilike(dossiers.email, searchTerm),
        ilike(dossiers.commune, searchTerm),
        ilike(dossiers.reference, searchTerm),
      ),
    );
  }

  const whereClause =
    conditions.length > 0 ? and(...conditions) : undefined;

  const [totalResult] = await db
    .select({ value: count() })
    .from(dossiers)
    .where(whereClause);

  const data = await db
    .select()
    .from(dossiers)
    .where(whereClause)
    .orderBy(desc(dossiers.createdAt))
    .limit(limit)
    .offset(offset);

  return { data, count: totalResult?.value ?? 0 };
}

/**
 * Met a jour les informations d'un dossier.
 */
export async function updateDossier(
  id: string,
  data: Partial<{
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    adresse: string;
    commune: string;
    codePostal: string;
    cadastre: string;
    statut: 'actif' | 'suspendu' | 'clos' | 'non_eligible';
    userId: string | null;
  }>,
) {
  const [updated] = await db
    .update(dossiers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(dossiers.id, id))
    .returning();

  return updated ?? null;
}

/**
 * Change l'etape d'un dossier et ajoute une entree historique.
 */
export async function advanceEtape(
  id: string,
  newEtape: number,
  authorId: string,
) {
  if (newEtape < 1 || newEtape > 10) {
    throw new Error("Etape invalide (doit etre entre 1 et 10).");
  }

  return db.transaction(async (tx) => {
    const [dossier] = await tx
      .select({ etape: dossiers.etape, reference: dossiers.reference })
      .from(dossiers)
      .where(eq(dossiers.id, id))
      .limit(1);

    if (!dossier) return null;

    const now = new Date();
    const [updated] = await tx
      .update(dossiers)
      .set({ etape: newEtape, etapeUpdatedAt: now, updatedAt: now })
      .where(eq(dossiers.id, id))
      .returning();

    await tx.insert(dossierHistory).values({
      dossierId: id,
      type: 'etape_change',
      content: `Etape ${dossier.etape} → ${newEtape}`,
      authorId,
    });

    return updated;
  });
}

/**
 * Coche ou decoche un document et ajoute une entree historique.
 */
export async function toggleDocument(
  docId: string,
  received: boolean,
  authorId: string,
) {
  const now = new Date();
  const [updated] = await db
    .update(dossierDocuments)
    .set({
      received,
      receivedAt: received ? now : null,
    })
    .where(eq(dossierDocuments.id, docId))
    .returning();

  if (!updated) return null;

  await db.insert(dossierHistory).values({
    dossierId: updated.dossierId,
    type: 'document',
    content: received
      ? `Document "${updated.label}" recu`
      : `Document "${updated.label}" marque comme non recu`,
    authorId,
  });

  return updated;
}

/**
 * Ajoute une note a l'historique d'un dossier.
 */
export async function addNote(
  dossierId: string,
  content: string,
  authorId: string,
) {
  // Verifier que le dossier existe avant l'insertion
  const [dossier] = await db
    .select({ id: dossiers.id })
    .from(dossiers)
    .where(eq(dossiers.id, dossierId))
    .limit(1);

  if (!dossier) return null;

  const [entry] = await db
    .insert(dossierHistory)
    .values({
      dossierId,
      type: 'note',
      content,
      authorId,
    })
    .returning();

  return entry;
}
