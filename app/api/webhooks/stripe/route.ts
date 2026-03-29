import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import { dossiers, dossierHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: 'Configuration Stripe manquante.' },
      { status: 400 },
    );
  }

  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json(
      { error: 'Corps illisible.' },
      { status: 400 },
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature invalide:', err);
    return NextResponse.json(
      { error: 'Signature invalide.' },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const dossierId = session.metadata?.dossierId;

    if (!dossierId) {
      console.warn('[stripe-webhook] Pas de dossierId dans metadata');
      return NextResponse.json({ received: true });
    }

    const [dossier] = await db
      .select({ id: dossiers.id, etape: dossiers.etape, paidAt: dossiers.paidAt })
      .from(dossiers)
      .where(eq(dossiers.id, dossierId))
      .limit(1);

    if (!dossier) {
      console.warn(`[stripe-webhook] Dossier ${dossierId} introuvable`);
      return NextResponse.json({ received: true });
    }

    // Eviter le double traitement
    if (dossier.paidAt) {
      console.info(`[stripe-webhook] Dossier ${dossierId} deja paye, ignore`);
      return NextResponse.json({ received: true });
    }

    const now = new Date();

    // Marquer comme paye et avancer a l'etape 7
    await db
      .update(dossiers)
      .set({
        paidAt: now,
        etape: 7,
        etapeUpdatedAt: now,
        updatedAt: now,
      })
      .where(eq(dossiers.id, dossierId));

    // Ajouter l'historique
    await db.insert(dossierHistory).values([
      {
        dossierId,
        type: 'note',
        content: `Paiement de 250 EUR recu (Stripe ${session.id})`,
        authorId: null,
      },
      {
        dossierId,
        type: 'etape_change',
        content: 'Etape 6 → 7',
        authorId: null,
      },
    ]);

    console.info(
      `[stripe-webhook] Paiement confirme pour dossier ${dossierId}, avance a etape 7`,
    );
  }

  return NextResponse.json({ received: true });
}
