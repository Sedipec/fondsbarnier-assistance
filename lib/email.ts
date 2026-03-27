import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendAdminInvitationEmail(
  email: string,
  inviteUrl: string,
  invitedByName: string,
) {
  const safeName = escapeHtml(invitedByName);
  await resend.emails.send({
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
