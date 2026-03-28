import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcryptjs from 'bcryptjs';
import {
  users,
  sources,
  dossiers,
  dossierDocuments,
  dossierHistory,
} from './schema';
import { eq } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';

type DossierInsert = Omit<InferInsertModel<typeof dossiers>, 'sourceId'> & {
  sourceSlug: string;
};

// 20 dossiers fictifs avec donnees variees
const seedDossiers: DossierInsert[] = [
  {
    reference: 'FBA-2025-0001',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@example.fr',
    telephone: '06 12 34 56 78',
    adresse: '12 rue des Lilas',
    commune: 'Nimes',
    codePostal: '30000',
    cadastre: 'AB-1234',
    statut: 'actif',
    etape: 3,
    sourceSlug: 'portail',
    createdAt: new Date('2025-09-15'),
  },
  {
    reference: 'FBA-2025-0002',
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie.martin@example.fr',
    telephone: '06 23 45 67 89',
    adresse: '45 avenue de la Republique',
    commune: 'Ales',
    codePostal: '30100',
    cadastre: 'CD-5678',
    statut: 'clos',
    etape: 5,
    sourceSlug: 'formulaire',
    createdAt: new Date('2025-08-20'),
  },
  {
    reference: 'FBA-2025-0003',
    nom: 'Bernard',
    prenom: 'Pierre',
    email: 'pierre.bernard@example.fr',
    telephone: '06 34 56 78 90',
    adresse: '8 place du Marche',
    commune: 'Beziers',
    codePostal: '34500',
    cadastre: 'EF-9012',
    statut: 'suspendu',
    etape: 2,
    sourceSlug: 'appel',
    createdAt: new Date('2025-10-05'),
  },
  {
    reference: 'FBA-2025-0004',
    nom: 'Petit',
    prenom: 'Marie',
    email: 'marie.petit@example.fr',
    telephone: '06 45 67 89 01',
    adresse: '23 boulevard Gambetta',
    commune: 'Montpellier',
    codePostal: '34000',
    statut: 'actif',
    etape: 1,
    sourceSlug: 'portail',
    createdAt: new Date('2025-11-12'),
  },
  {
    reference: 'FBA-2025-0005',
    nom: 'Robert',
    prenom: 'Alain',
    email: 'alain.robert@example.fr',
    telephone: '06 56 78 90 12',
    adresse: '17 impasse des Oliviers',
    commune: 'Arles',
    codePostal: '13200',
    cadastre: 'GH-3456',
    statut: 'non_eligible',
    etape: 1,
    sourceSlug: 'formulaire',
    createdAt: new Date('2025-07-30'),
  },
  {
    reference: 'FBA-2025-0006',
    nom: 'Richard',
    prenom: 'Isabelle',
    email: 'isabelle.richard@example.fr',
    telephone: '06 67 89 01 23',
    adresse: '5 chemin de la Fontaine',
    commune: 'Avignon',
    codePostal: '84000',
    cadastre: 'IJ-7890',
    statut: 'actif',
    etape: 4,
    sourceSlug: 'appel',
    createdAt: new Date('2025-10-22'),
  },
  {
    reference: 'FBA-2025-0007',
    nom: 'Durand',
    prenom: 'Philippe',
    email: 'philippe.durand@example.fr',
    telephone: '06 78 90 12 34',
    adresse: '31 rue Victor Hugo',
    commune: 'Perpignan',
    codePostal: '66000',
    statut: 'actif',
    etape: 2,
    sourceSlug: 'portail',
    createdAt: new Date('2025-12-01'),
  },
  {
    reference: 'FBA-2025-0008',
    nom: 'Leroy',
    prenom: 'Catherine',
    email: 'catherine.leroy@example.fr',
    telephone: '06 89 01 23 45',
    adresse: '9 allee des Platanes',
    commune: 'Carcassonne',
    codePostal: '11000',
    cadastre: 'KL-1234',
    statut: 'clos',
    etape: 5,
    sourceSlug: 'formulaire',
    createdAt: new Date('2025-06-15'),
  },
  {
    reference: 'FBA-2025-0009',
    nom: 'Moreau',
    prenom: 'Francois',
    email: 'francois.moreau@example.fr',
    telephone: '06 90 12 34 56',
    adresse: '14 rue Pasteur',
    commune: 'Narbonne',
    codePostal: '11100',
    statut: 'suspendu',
    etape: 3,
    sourceSlug: 'appel',
    createdAt: new Date('2025-09-28'),
  },
  {
    reference: 'FBA-2025-0010',
    nom: 'Simon',
    prenom: 'Nathalie',
    email: 'nathalie.simon@example.fr',
    telephone: '06 01 23 45 67',
    adresse: '27 route de Marseille',
    commune: 'Aix-en-Provence',
    codePostal: '13100',
    cadastre: 'MN-5678',
    statut: 'actif',
    etape: 1,
    sourceSlug: 'portail',
    createdAt: new Date('2026-01-08'),
  },
  {
    reference: 'FBA-2026-0011',
    nom: 'Laurent',
    prenom: 'Michel',
    email: 'michel.laurent@example.fr',
    telephone: '07 12 34 56 78',
    adresse: '3 place de la Mairie',
    commune: 'Sete',
    codePostal: '34200',
    cadastre: 'OP-9012',
    statut: 'actif',
    etape: 2,
    sourceSlug: 'formulaire',
    createdAt: new Date('2026-01-20'),
  },
  {
    reference: 'FBA-2026-0012',
    nom: 'Lefebvre',
    prenom: 'Christine',
    email: 'christine.lefebvre@example.fr',
    telephone: '07 23 45 67 89',
    adresse: '56 avenue Jean Jaures',
    commune: 'Toulouse',
    codePostal: '31000',
    statut: 'non_eligible',
    etape: 1,
    sourceSlug: 'appel',
    createdAt: new Date('2025-11-25'),
  },
  {
    reference: 'FBA-2026-0013',
    nom: 'Lefevre',
    prenom: 'Antoine',
    email: 'antoine.lefevre@example.fr',
    telephone: '07 34 56 78 90',
    adresse: '42 rue du Faubourg',
    commune: 'Lunel',
    codePostal: '34400',
    cadastre: 'QR-3456',
    statut: 'actif',
    etape: 3,
    sourceSlug: 'portail',
    createdAt: new Date('2026-02-05'),
  },
  {
    reference: 'FBA-2026-0014',
    nom: 'Roux',
    prenom: 'Valerie',
    email: 'valerie.roux@example.fr',
    telephone: '07 45 67 89 01',
    adresse: '19 chemin des Vignes',
    commune: 'Orange',
    codePostal: '84100',
    statut: 'clos',
    etape: 5,
    sourceSlug: 'formulaire',
    createdAt: new Date('2025-08-10'),
  },
  {
    reference: 'FBA-2026-0015',
    nom: 'David',
    prenom: 'Eric',
    email: 'eric.david@example.fr',
    telephone: '07 56 78 90 12',
    adresse: '7 rue de la Gare',
    commune: 'Agde',
    codePostal: '34300',
    cadastre: 'ST-7890',
    statut: 'actif',
    etape: 4,
    sourceSlug: 'appel',
    createdAt: new Date('2026-02-18'),
  },
  {
    reference: 'FBA-2026-0016',
    nom: 'Bertrand',
    prenom: 'Sandrine',
    email: 'sandrine.bertrand@example.fr',
    telephone: '07 67 89 01 23',
    adresse: '33 rue Nationale',
    commune: 'Salon-de-Provence',
    codePostal: '13300',
    statut: 'suspendu',
    etape: 2,
    sourceSlug: 'portail',
    createdAt: new Date('2026-01-14'),
  },
  {
    reference: 'FBA-2026-0017',
    nom: 'Morel',
    prenom: 'Jacques',
    email: 'jacques.morel@example.fr',
    telephone: '07 78 90 12 34',
    adresse: '11 lotissement Les Cigales',
    commune: 'Villeneuve-les-Avignon',
    codePostal: '30400',
    cadastre: 'UV-1234',
    statut: 'actif',
    etape: 1,
    sourceSlug: 'formulaire',
    createdAt: new Date('2026-03-01'),
  },
  {
    reference: 'FBA-2026-0018',
    nom: 'Fournier',
    prenom: 'Pascale',
    email: 'pascale.fournier@example.fr',
    telephone: '07 89 01 23 45',
    adresse: '25 boulevard du Midi',
    commune: 'Martigues',
    codePostal: '13500',
    statut: 'non_eligible',
    etape: 1,
    sourceSlug: 'appel',
    createdAt: new Date('2025-12-20'),
  },
  {
    reference: 'FBA-2026-0019',
    nom: 'Girard',
    prenom: 'Thierry',
    email: 'thierry.girard@example.fr',
    telephone: '06 11 22 33 44',
    adresse: '48 rue des Remparts',
    commune: 'Uzes',
    codePostal: '30700',
    cadastre: 'WX-5678',
    statut: 'actif',
    etape: 5,
    sourceSlug: 'portail',
    createdAt: new Date('2025-07-05'),
  },
  {
    reference: 'FBA-2026-0020',
    nom: 'Bonnet',
    prenom: 'Helene',
    email: 'helene.bonnet@example.fr',
    telephone: '06 22 33 44 55',
    adresse: '6 impasse du Lavoir',
    commune: 'Sommieres',
    codePostal: '30250',
    cadastre: 'YZ-9012',
    statut: 'clos',
    etape: 5,
    sourceSlug: 'formulaire',
    createdAt: new Date('2025-10-15'),
  },
];

// Documents types pour chaque dossier (sous-ensemble aleatoire)
const documentTemplates: {
  type:
    | 'assurance'
    | 'cadastre'
    | 'rib'
    | 'devis'
    | 'diagnostic'
    | 'valeur_venale'
    | 'autre';
  label: string;
}[] = [
  { type: 'assurance', label: "Attestation d'assurance habitation" },
  { type: 'cadastre', label: 'Releve cadastral' },
  { type: 'rib', label: 'RIB du beneficiaire' },
  { type: 'devis', label: 'Devis de travaux' },
  { type: 'diagnostic', label: 'Diagnostic inondation' },
];

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

  let adminId: string;

  if (existingAdmin.length > 0) {
    console.log(`Admin ${adminEmail} existe deja.`);
    adminId = existingAdmin[0].id;
  } else {
    const hashedPassword = await bcryptjs.hash(adminPassword, 12);

    const [admin] = await db
      .insert(users)
      .values({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      })
      .returning({ id: users.id });

    adminId = admin.id;
    console.log(`Admin cree: ${adminEmail}`);
  }

  // Seed des sources MVP
  const mvpSources = [
    { slug: 'portail', label: 'Portail client' },
    { slug: 'formulaire', label: 'Formulaire site vitrine' },
    { slug: 'appel', label: 'Appel telephonique' },
  ];

  for (const src of mvpSources) {
    const existing = await db
      .select()
      .from(sources)
      .where(eq(sources.slug, src.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(sources).values(src);
      console.log(`Source creee: ${src.slug}`);
    } else {
      console.log(`Source ${src.slug} existe deja.`);
    }
  }

  // Recuperer les sources pour le mapping slug -> id
  const allSources = await db.select().from(sources);
  const sourceMap = new Map(allSources.map((s) => [s.slug, s.id]));

  // Seed des 20 dossiers fictifs
  for (const dossierData of seedDossiers) {
    const existing = await db
      .select()
      .from(dossiers)
      .where(eq(dossiers.reference, dossierData.reference))
      .limit(1);

    if (existing.length > 0) {
      console.log(`Dossier ${dossierData.reference} existe deja.`);
      continue;
    }

    const sourceId = sourceMap.get(dossierData.sourceSlug);
    if (!sourceId) {
      console.error(
        `Source introuvable pour le slug: ${dossierData.sourceSlug}`,
      );
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sourceSlug, ...dossierValues } = dossierData;

    const [inserted] = await db
      .insert(dossiers)
      .values({
        ...dossierValues,
        sourceId,
        updatedAt: dossierValues.createdAt,
        etapeUpdatedAt: dossierValues.createdAt,
      })
      .returning({ id: dossiers.id });

    // Ajouter des documents (les premiers N selon l'etape)
    const etape = dossierData.etape ?? 1;
    const docCount = Math.min(etape, documentTemplates.length);
    for (let i = 0; i < docCount; i++) {
      const template = documentTemplates[i];
      const received = i < etape - 1;
      await db.insert(dossierDocuments).values({
        dossierId: inserted.id,
        type: template.type,
        label: template.label,
        received,
        receivedAt: received ? dossierValues.createdAt : null,
      });
    }

    // Ajouter une entree historique de creation
    await db.insert(dossierHistory).values({
      dossierId: inserted.id,
      type: 'creation',
      content: `Dossier ${dossierData.reference} cree`,
      authorId: adminId,
      createdAt: dossierValues.createdAt,
    });

    // Ajouter des transitions d'etape si etape > 1
    for (let step = 1; step < etape; step++) {
      const stepDate = new Date(dossierValues.createdAt!);
      stepDate.setDate(stepDate.getDate() + step * 7);
      await db.insert(dossierHistory).values({
        dossierId: inserted.id,
        type: 'etape_change',
        content: `Etape ${step} → ${step + 1}`,
        authorId: adminId,
        createdAt: stepDate,
      });
    }

    console.log(`Dossier cree: ${dossierData.reference}`);
  }

  await client.end();
  console.log('Seed termine.');
}

seed().catch((err) => {
  console.error('Erreur seed:', err);
  process.exit(1);
});
