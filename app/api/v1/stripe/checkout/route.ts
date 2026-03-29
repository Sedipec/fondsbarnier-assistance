import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import { dossiers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  let body: { dossierId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Corps de requete invalide.' },
      { status: 400 },
    );
  }

  if (!body.dossierId) {
    return NextResponse.json(
      { error: 'dossierId requis.' },
      { status: 400 },
    );
  }

  // Recuperer le dossier
  const [dossier] = await db
    .select()
    .from(dossiers)
    .where(eq(dossiers.id, body.dossierId))
    .limit(1);

  if (!dossier) {
    return NextResponse.json(
      { error: 'Dossier introuvable.' },
      { status: 404 },
    );
  }

  // Verifier que c'est bien le dossier du client (ou un admin)
  const role = (session.user as { role?: string }).role;
  if (role !== 'admin' && dossier.userId !== session.user.id) {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  // Verifier que le dossier est a l'etape 6 et pas deja paye
  if (dossier.etape !== 6) {
    return NextResponse.json(
      { error: 'Le dossier n\'est pas a l\'etape de signature du devis.' },
      { status: 400 },
    );
  }

  if (dossier.paidAt) {
    return NextResponse.json(
      { error: 'Ce dossier a deja ete paye.' },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.com';
  const stripe = getStripe();

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: dossier.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Devis Fonds Barnier — ${dossier.reference}`,
            description: 'Honoraires assistance dossier Fonds Barnier (Cat Nat)',
          },
          unit_amount: 25000, // 250,00 EUR en centimes
        },
        quantity: 1,
      },
    ],
    metadata: {
      dossierId: dossier.id,
      reference: dossier.reference,
    },
    success_url: `${appUrl}/espace/mon-dossier?payment=success`,
    cancel_url: `${appUrl}/espace/mon-dossier?payment=cancelled`,
  });

  // Stocker l'ID de session Stripe
  await db
    .update(dossiers)
    .set({ stripeSessionId: checkoutSession.id, updatedAt: new Date() })
    .where(eq(dossiers.id, dossier.id));

  return NextResponse.json({ data: { url: checkoutSession.url } });
}
