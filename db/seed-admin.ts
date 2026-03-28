import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';
import { users } from './schema';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL est requis');
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail) {
    console.error('ADMIN_EMAIL est requis');
    process.exit(1);
  }

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD est requis');
    process.exit(1);
  }

  if (!adminName) {
    console.error('ADMIN_NAME est requis');
    process.exit(1);
  }

  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Verifier si l'utilisateur existe deja
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(
        `Utilisateur admin "${adminEmail}" existe deja, aucune action requise.`,
      );
      await client.end();
      return;
    }

    // Hacher le mot de passe avec bcrypt
    const hashedPassword = await bcryptjs.hash(adminPassword, 12);

    // Inserer l'utilisateur admin
    await db.insert(users).values({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    console.log(
      `Utilisateur admin "${adminName}" (${adminEmail}) cree avec succes.`,
    );
  } catch (error) {
    console.error("Erreur lors de la creation de l'utilisateur admin :", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedAdmin();
