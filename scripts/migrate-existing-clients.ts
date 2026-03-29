/**
 * Script one-shot pour creer les comptes clients des dossiers existants
 * qui n'ont pas encore de userId, et leur envoyer l'email de bienvenue.
 *
 * Usage: npx tsx scripts/migrate-existing-clients.ts
 *
 * Options:
 *   --dry-run    Affiche ce qui serait fait sans executer
 *   --no-email   Cree les comptes sans envoyer les emails
 */
import 'dotenv/config';
import { db } from '@/db';
import { dossiers, users } from '@/db/schema';
import { eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noEmail = args.includes('--no-email');

async function main() {
  console.log('=== Migration des clients existants ===');
  if (dryRun) console.log('[DRY RUN] Aucune modification ne sera effectuee.\n');

  // Recuperer tous les dossiers sans userId
  const orphanDossiers = await db
    .select()
    .from(dossiers)
    .where(isNull(dossiers.userId));

  console.log(`${orphanDossiers.length} dossier(s) sans compte client.\n`);

  if (orphanDossiers.length === 0) {
    console.log('Rien a faire.');
    process.exit(0);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.fondsbarnier.fr';
  let created = 0;
  let linked = 0;
  let emailsSent = 0;
  let errors = 0;

  for (const dossier of orphanDossiers) {
    const email = dossier.email.trim().toLowerCase();
    console.log(`[${dossier.reference}] ${dossier.prenom} ${dossier.nom} <${email}>`);

    if (dryRun) {
      console.log('  -> [DRY RUN] Compte serait cree + email envoye\n');
      continue;
    }

    try {
      // Verifier si un user existe deja avec cet email
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      let userId: string;
      let tempPassword: string | null = null;

      if (existingUser) {
        userId = existingUser.id;
        console.log(`  -> Compte existant trouve (${userId}), liaison...`);
        linked++;
      } else {
        tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const [newUser] = await db
          .insert(users)
          .values({
            name: `${dossier.prenom} ${dossier.nom}`,
            email,
            password: hashedPassword,
            role: 'client',
            phone: dossier.telephone ?? null,
          })
          .returning({ id: users.id });

        userId = newUser.id;
        console.log(`  -> Compte cree (${userId}), mdp: ${tempPassword}`);
        created++;
      }

      // Lier le dossier au user
      await db
        .update(dossiers)
        .set({ userId })
        .where(eq(dossiers.id, dossier.id));

      // Envoyer l'email de bienvenue (seulement pour les nouveaux comptes)
      if (tempPassword && !noEmail) {
        try {
          await sendWelcomeEmail(
            email,
            dossier.prenom,
            dossier.reference,
            tempPassword,
            `${appUrl}/auth/login`,
          );
          emailsSent++;
          console.log('  -> Email de bienvenue envoye');
        } catch (emailErr) {
          console.error('  -> ERREUR envoi email:', emailErr);
          errors++;
        }
      }

      console.log('');
    } catch (err) {
      console.error(`  -> ERREUR:`, err);
      errors++;
    }
  }

  console.log('\n=== Resultat ===');
  console.log(`Comptes crees:    ${created}`);
  console.log(`Comptes lies:     ${linked}`);
  console.log(`Emails envoyes:   ${emailsSent}`);
  console.log(`Erreurs:          ${errors}`);

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
