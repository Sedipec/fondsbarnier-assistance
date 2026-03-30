import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendWelcomeEmail(
  email: string,
  prenom: string,
  reference: string,
  tempPassword: string,
  loginUrl: string,
) {
  const safePrenom = escapeHtml(prenom);
  const safeRef = escapeHtml(reference);
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: `Votre dossier ${reference} - FondsBarnierAssistance`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue sur FondsBarnierAssistance</h2>
        <p>Bonjour ${safePrenom},</p>
        <p>Votre dossier <strong>${safeRef}</strong> a bien ete cree. Vous pouvez des maintenant suivre son avancement en ligne.</p>
        <p>Voici vos identifiants de connexion :</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Email :</strong> ${escapeHtml(email)}</p>
          <p style="margin: 4px 0;"><strong>Mot de passe temporaire :</strong> <code style="background: #e4e4e7; padding: 2px 8px; border-radius: 4px;">${escapeHtml(tempPassword)}</code></p>
        </div>
        <p>Nous vous recommandons de changer votre mot de passe apres votre premiere connexion.</p>
        <p>
          <a href="${loginUrl}" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Acceder a mon dossier
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">Si vous n'avez pas fait de demande d'assistance Fonds Barnier, veuillez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string,
) {
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: 'Reinitialisation de mot de passe - FondsBarnierAssistance',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reinitialisation de mot de passe</h2>
        <p>Bonjour,</p>
        <p>Vous avez demande la reinitialisation de votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Reinitialiser mon mot de passe
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
      </div>
    `,
  });
}

export async function sendEtapeNotificationEmail(
  email: string,
  prenom: string,
  reference: string,
  newEtape: number,
  etapeLabel: string,
  actionMessage: string,
) {
  const safePrenom = escapeHtml(prenom);
  const safeRef = escapeHtml(reference);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.com';
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: `Dossier ${reference} — Nouvelle etape : ${etapeLabel}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Mise a jour de votre dossier</h2>
        <p>Bonjour ${safePrenom},</p>
        <p>Votre dossier <strong>${safeRef}</strong> a progresse.</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Nouvelle etape :</strong> ${newEtape}. ${escapeHtml(etapeLabel)}</p>
        </div>
        <p>${escapeHtml(actionMessage)}</p>
        <p>
          <a href="${appUrl}/espace/mon-dossier" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Voir mon dossier
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
      </div>
    `,
  });
}

export async function sendPaymentConfirmationEmail(
  email: string,
  prenom: string,
  reference: string,
  invoiceUrl: string | null,
) {
  const safePrenom = escapeHtml(prenom);
  const safeRef = escapeHtml(reference);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.com';
  const invoiceBlock = invoiceUrl
    ? `
        <p>
          <a href="${invoiceUrl}" style="display: inline-block; background-color: #374151; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
            Telecharger ma facture
          </a>
        </p>`
    : '';
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: `Paiement confirme — Dossier ${reference}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Paiement confirme</h2>
        <p>Bonjour ${safePrenom},</p>
        <p>Nous confirmons la reception de votre paiement de <strong>250 EUR TTC</strong> pour le dossier <strong>${safeRef}</strong>.</p>
        <p>Votre dossier passe maintenant a l'etape de collecte des pieces justificatives.</p>
        ${invoiceBlock}
        <p>
          <a href="${appUrl}/espace/mon-dossier" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Voir mon dossier
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
      </div>
    `,
  });
}

export async function sendAccountDeletionEmail(
  email: string,
  prenom: string,
) {
  const safePrenom = escapeHtml(prenom);
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: 'Confirmation de suppression de compte - FondsBarnierAssistance',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Suppression de votre compte</h2>
        <p>Bonjour ${safePrenom},</p>
        <p>Nous vous confirmons que votre compte FondsBarnierAssistance a bien ete supprime conformement a votre demande.</p>
        <p>Vos donnees personnelles ont ete anonymisees dans nos systemes, conformement au RGPD (droit a l'effacement).</p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">Si vous n'etes pas a l'origine de cette demande, veuillez nous contacter immediatement.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
      </div>
    `,
  });
}

export async function sendNewDossierConfirmationEmail(
  email: string,
  prenom: string,
  reference: string,
) {
  const safePrenom = escapeHtml(prenom);
  const safeRef = escapeHtml(reference);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.com';
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: `Demande recue — Reference ${reference}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Votre demande a bien ete recue</h2>
        <p>Bonjour ${safePrenom},</p>
        <p>Nous avons bien recu votre demande et un dossier a ete ouvert sous la reference <strong>${safeRef}</strong>.</p>
        <p>Notre equipe va etudier votre situation et reviendra vers vous sous <strong>48 heures ouvrées</strong>.</p>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;">Vous recevrez prochainement vos identifiants pour suivre l'avancement de votre dossier en ligne sur votre espace personnel.</p>
        </div>
        <p>
          <a href="${appUrl}" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Visiter FondsBarnierAssistance
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">Si vous n'avez pas fait de demande, veuillez ignorer cet email.</p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Aide aux sinistres d'inondation</p>
      </div>
    `,
  });
}

export async function sendAdminNewDossierNotificationEmail(
  reference: string,
  nom: string,
  prenom: string,
  email: string,
  source: string,
  message: string | null,
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fondsbarnier.fr';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.com';
  const messageBlock = message
    ? `<p><strong>Message :</strong> ${escapeHtml(message)}</p>`
    : '';
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: adminEmail,
    subject: `Nouveau dossier ${reference} — ${escapeHtml(prenom)} ${escapeHtml(nom)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Nouveau dossier cree</h2>
        <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Reference :</strong> ${escapeHtml(reference)}</p>
          <p style="margin: 4px 0;"><strong>Nom :</strong> ${escapeHtml(prenom)} ${escapeHtml(nom)}</p>
          <p style="margin: 4px 0;"><strong>Email :</strong> ${escapeHtml(email)}</p>
          <p style="margin: 4px 0;"><strong>Source :</strong> ${escapeHtml(source)}</p>
          ${messageBlock}
        </div>
        <p>
          <a href="${appUrl}/admin/dossiers" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Voir dans l'admin
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">FondsBarnierAssistance — Notification automatique</p>
      </div>
    `,
  });
}

export async function sendAdminInvitationEmail(
  email: string,
  inviteUrl: string,
  invitedByName: string,
) {
  const safeName = escapeHtml(invitedByName);
  await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@fondsbarnier.fr',
    to: email,
    subject: 'Invitation administrateur - FondsBarnierAssistance',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invitation administrateur</h2>
        <p>Bonjour,</p>
        <p><strong>${safeName}</strong> vous invite a rejoindre FondsBarnierAssistance en tant qu'administrateur.</p>
        <p>Cliquez sur le lien ci-dessous pour creer votre compte :</p>
        <p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #570df8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
            Creer mon compte admin
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">Ce lien expire dans 48 heures.</p>
        <p style="color: #666; font-size: 12px;">Si vous n'avez pas demande cette invitation, ignorez cet email.</p>
      </div>
    `,
  });
}
