import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { sources, dossierHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createDossier } from '@/lib/dossier';

// Slug de la source "Formulaire site vitrine" (seedé en base)
const SOURCE_SLUG = 'formulaire';

// Les propriétés HubSpot peuvent être { value: string } ou directement une string
type HubSpotPropValue = { value: string } | string;

function extractProp(val: HubSpotPropValue | undefined): string | null {
  if (!val) return null;
  const raw = typeof val === 'string' ? val : val.value;
  return raw?.trim() || null;
}

/**
 * Vérifie la signature HMAC d'une requête HubSpot.
 *
 * HubSpot v3 : X-HubSpot-Signature-v3 = base64(HMAC-SHA256(POST + url + body + timestamp))
 * HubSpot v1 : X-HubSpot-Signature    = hex(SHA256(clientSecret + body))
 *
 * Si HUBSPOT_CLIENT_SECRET n'est pas défini, la vérification est ignorée (dev uniquement).
 */
function verifySignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.HUBSPOT_CLIENT_SECRET;

  if (!secret) {
    console.warn(
      '[hubspot-webhook] HUBSPOT_CLIENT_SECRET non configuré — vérification de signature ignorée',
    );
    return true;
  }

  // Signature v3 (prioritaire)
  const sigV3 = req.headers.get('x-hubspot-signature-v3');
  if (sigV3) {
    const timestamp = req.headers.get('x-hubspot-request-timestamp');
    if (!timestamp) return false;

    // Rejeter les requêtes datant de plus de 5 minutes (anti-replay)
    if (Date.now() - Number(timestamp) > 300_000) return false;

    const message = `POST${req.url}${rawBody}${timestamp}`;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('base64');

    try {
      return crypto.timingSafeEqual(Buffer.from(sigV3), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  // Signature v1 (fallback)
  const sigV1 = req.headers.get('x-hubspot-signature');
  if (sigV1) {
    const expected = crypto
      .createHash('sha256')
      .update(secret + rawBody)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(sigV1), Buffer.from(expected));
    } catch {
      return false;
    }
  }

  // Aucune signature présente et secret configuré → refus
  return false;
}

export async function POST(req: NextRequest) {
  // Lire le corps brut avant tout (nécessaire pour la vérification HMAC)
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requête illisible.' },
      { status: 400 },
    );
  }

  if (!verifySignature(req, rawBody)) {
    console.warn('[hubspot-webhook] Signature invalide — requête rejetée');
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 401 });
  }

  // Parser le JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  // Normaliser : HubSpot envoie un objet (workflow) ou un tableau (subscription)
  const event = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!event || typeof event !== 'object' || !('properties' in event)) {
    return NextResponse.json(
      { error: 'Payload invalide : champ "properties" manquant.' },
      { status: 400 },
    );
  }

  const props = (event as { properties: Record<string, HubSpotPropValue> })
    .properties;

  // Mapping HubSpot → dossier
  const email = extractProp(props['email']);
  const nom = extractProp(props['lastname']);
  const prenom = extractProp(props['firstname']);
  const telephone = extractProp(props['phone']);
  const adresse = extractProp(props['address']);
  const codePostal = extractProp(props['zip']);
  const commune = extractProp(props['city']);
  const message = extractProp(props['message']);

  // Validation des champs obligatoires
  if (!email || !nom || !prenom) {
    console.warn('[hubspot-webhook] Champs obligatoires manquants', {
      email,
      nom,
      prenom,
    });
    return NextResponse.json(
      { error: 'Champs obligatoires manquants : email, lastname, firstname.' },
      { status: 422 },
    );
  }

  // Résoudre l'ID de la source "formulaire"
  const [source] = await db
    .select({ id: sources.id })
    .from(sources)
    .where(eq(sources.slug, SOURCE_SLUG))
    .limit(1);

  if (!source) {
    console.error(
      `[hubspot-webhook] Source "${SOURCE_SLUG}" introuvable en base — vérifiez le seed`,
    );
    return NextResponse.json(
      { error: `Source "${SOURCE_SLUG}" non configurée.` },
      { status: 500 },
    );
  }

  // Créer le dossier via le service existant (déduplication incluse)
  let result;
  try {
    result = await createDossier({
      nom,
      prenom,
      email,
      telephone,
      adresse,
      commune,
      codePostal,
      sourceId: source.id,
      userId: null,
    });
  } catch (err) {
    console.error('[hubspot-webhook] Erreur createDossier:', err);
    return NextResponse.json(
      { error: 'Erreur interne lors de la création du dossier.' },
      { status: 500 },
    );
  }

  // Doublon détecté → 200 pour éviter les relances HubSpot
  if (!result.success) {
    console.info('[hubspot-webhook] Doublon ignoré:', result.error);
    return NextResponse.json(
      { skipped: true, reason: result.error },
      { status: 200 },
    );
  }

  // Stocker le message du formulaire comme note dans l'historique
  if (message && result.dossier) {
    await db.insert(dossierHistory).values({
      dossierId: result.dossier.id,
      type: 'note',
      content: `Message formulaire web : ${message}`,
      authorId: null,
    });
  }

  console.info(
    `[hubspot-webhook] Dossier créé : ${result.dossier?.reference}`,
    result.warning ? `| warning: ${result.warning}` : '',
  );

  return NextResponse.json(
    {
      created: true,
      reference: result.dossier?.reference,
      warning: result.warning ?? null,
    },
    { status: 201 },
  );
}
