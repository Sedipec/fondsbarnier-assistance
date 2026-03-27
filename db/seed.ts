import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL est requis');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fondsbarnier.fr';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminName = process.env.ADMIN_NAME || 'Administrateur';

  // Verifier si l'admin existe deja
  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log(`Admin ${adminEmail} existe deja.`);
    await client.end();
    return;
  }

  const hashedPassword = await bcryptjs.hash(adminPassword, 12);

  await db.insert(users).values({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin',
  });

  console.log(`Admin cree: ${adminEmail}`);
  await client.end();
}

seed().catch((err) => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
