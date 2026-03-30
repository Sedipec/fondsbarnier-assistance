import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const REQUIRED_FIELDS = ['nom', 'prenom', 'email'] as const;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
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
  const emailStr = String(body.email).trim();
  if (!emailStr.includes('@') || !emailStr.includes('.')) {
    return NextResponse.json(
      { error: 'Format email invalide.' },
      { status: 400 },
    );
  }

  // Validation code postal (5 chiffres)
  const codePostal = body.codePostal ? String(body.codePostal).trim() : '';
  if (codePostal && !/^\d{5}$/.test(codePostal)) {
    return NextResponse.json(
      { error: 'Le code postal doit contenir 5 chiffres.' },
      { status: 400 },
    );
  }

  const nom = String(body.nom).trim();
  const prenom = String(body.prenom).trim();
  const telephone = body.telephone ? String(body.telephone).trim() : '';
  const adresse = body.adresse ? String(body.adresse).trim() : '';
  const commune = body.commune ? String(body.commune).trim() : '';
  const message = body.message ? String(body.message).trim() : '';

  // Envoi d'un email de notification a l'administrateur
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const adminEmail =
      process.env.ADMIN_CONTACT_EMAIL || 'contact@fondsbarnier.com';
    const fromEmail =
      process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr';

    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `Nouvelle demande d'assistance - ${escapeHtml(prenom)} ${escapeHtml(nom)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nouvelle demande d'assistance Fonds Barnier</h2>
          <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Nom :</strong> ${escapeHtml(nom)}</p>
            <p style="margin: 4px 0;"><strong>Prenom :</strong> ${escapeHtml(prenom)}</p>
            <p style="margin: 4px 0;"><strong>Email :</strong> ${escapeHtml(emailStr)}</p>
            ${telephone ? `<p style="margin: 4px 0;"><strong>Telephone :</strong> ${escapeHtml(telephone)}</p>` : ''}
            ${adresse ? `<p style="margin: 4px 0;"><strong>Adresse du bien :</strong> ${escapeHtml(adresse)}</p>` : ''}
            ${commune ? `<p style="margin: 4px 0;"><strong>Commune :</strong> ${escapeHtml(commune)}</p>` : ''}
            ${codePostal ? `<p style="margin: 4px 0;"><strong>Code postal :</strong> ${escapeHtml(codePostal)}</p>` : ''}
          </div>
          ${
            message
              ? `
          <h3>Message du demandeur</h3>
          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; border-left: 4px solid #570df8;">
            <p style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</p>
          </div>`
              : ''
          }
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Email envoye automatiquement depuis le formulaire de demande FondsBarnierAssistance.</p>
        </div>
      `,
    });

    // Envoi d'un email de confirmation au demandeur
    await resend.emails.send({
      from: fromEmail,
      to: emailStr,
      subject: 'Votre demande d\'assistance Fonds Barnier a bien ete recue',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Demande recue</h2>
          <p>Bonjour ${escapeHtml(prenom)},</p>
          <p>Nous avons bien recu votre demande d'assistance pour votre dossier Fonds Barnier.</p>
          <p>Notre equipe vous recontactera sous <strong>48 heures</strong> pour etudier votre eligibilite et vous accompagner dans les demarches.</p>
          <p>Si vous avez des questions, n'hesitez pas a nous contacter :</p>
          <ul>
            <li>Par email : <a href="mailto:contact@fondsbarnier.com">contact@fondsbarnier.com</a></li>
            <li>Par telephone : <a href="tel:+33188845252">01 88 84 52 52</a></li>
          </ul>
          <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
        </div>
      `,
    });
  } catch {
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande. Veuillez reessayer.' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { data: { success: true } },
    { status: 201 },
  );
}
