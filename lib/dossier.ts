import { db } from '@/db';
import { dossiers, sources, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export type CreateDossierInput = {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  commune: string;
  typeDeBien: string;
  sourceId: string;
  adresseComplete?: string | null;
  numeroCadastre?: string | null;
  gestionnaireId?: string | null;
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
 * Utilise un SELECT FOR UPDATE implicite via le comptage des dossiers
 * de l'annee en cours dans la meme transaction.
 */
async function generateReference(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FB-${year}-`;

  // Compter les dossiers de l'annee en cours avec lock
  const result = await tx.execute(sql`
    SELECT COUNT(*) as count
    FROM dossiers
    WHERE reference LIKE ${prefix + '%'}
    FOR UPDATE
  `);

  const count = Number(result[0]?.count ?? 0);
  const next = count + 1;

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
    return {
      success: false,
      error: 'Source invalide',
    };
  }

  // Dedup primaire : verifier unicite email
  const [existingByEmail] = await db
    .select({
      reference: dossiers.reference,
      gestionnaireId: dossiers.gestionnaireId,
    })
    .from(dossiers)
    .where(eq(dossiers.email, email))
    .limit(1);

  if (existingByEmail) {
    let gestionnaireName = 'Non assigne';
    if (existingByEmail.gestionnaireId) {
      const [gestionnaire] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, existingByEmail.gestionnaireId))
        .limit(1);
      if (gestionnaire?.name) {
        gestionnaireName = gestionnaire.name;
      }
    }

    return {
      success: false,
      error: `Dossier existant — #${existingByEmail.reference} (gestionnaire : ${gestionnaireName})`,
    };
  }

  // Dedup secondaire : telephone + nom + commune
  let warning: string | undefined;
  const nomNormalized = input.nom.trim().toLowerCase();

  const [similarDossier] = await db
    .select({
      reference: dossiers.reference,
    })
    .from(dossiers)
    .where(
      and(
        eq(sql`lower(trim(${dossiers.telephone}))`, input.telephone.trim()),
        eq(sql`lower(trim(${dossiers.nom}))`, nomNormalized),
        eq(
          sql`lower(trim(${dossiers.commune}))`,
          input.commune.trim().toLowerCase(),
        ),
      ),
    )
    .limit(1);

  if (similarDossier) {
    warning = `Dossier potentiellement similaire — #${similarDossier.reference} — Vérifiez avant de continuer`;
  }

  // Creation dans une transaction pour la reference thread-safe
  const newDossier = await db.transaction(async (tx) => {
    const reference = await generateReference(tx);

    const [created] = await tx
      .insert(dossiers)
      .values({
        nom: input.nom.trim(),
        prenom: input.prenom.trim(),
        email,
        telephone: input.telephone.trim(),
        commune: input.commune.trim(),
        typeDeBien: input.typeDeBien.trim(),
        adresseComplete: input.adresseComplete?.trim() ?? null,
        numeroCadastre: input.numeroCadastre?.trim() ?? null,
        reference,
        sourceId: input.sourceId,
        gestionnaireId: input.gestionnaireId ?? null,
      })
      .returning();

    return created;
  });

  return {
    success: true,
    dossier: newDossier,
    warning,
  };
}

/**
 * Met a jour l'etape d'un dossier et le timestamp etape_updated_at.
 */
export async function updateDossierEtape(
  dossierId: string,
  etape: number,
): Promise<typeof dossiers.$inferSelect | null> {
  const [updated] = await db
    .update(dossiers)
    .set({
      etape,
      etapeUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(dossiers.id, dossierId))
    .returning();

  return updated ?? null;
}
