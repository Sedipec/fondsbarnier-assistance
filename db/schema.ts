import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  primaryKey,
  integer,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// Enum pour les roles utilisateur
export const roleEnum = pgEnum('role', ['admin', 'client']);

// Table users
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').unique().notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  password: text('password'),
  role: roleEnum('role').default('client').notNull(),
  image: text('image'),
  isActive: integer('is_active').default(1).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

// Table accounts (OAuth)
export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

// Table sessions
export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// Table verification tokens
export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

// Table sources (referentiel canaux d'acquisition)
export const sources = pgTable('sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  label: text('label').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Enum pour les statuts de dossier
export const dossierStatutEnum = pgEnum('dossier_statut', [
  'nouveau',
  'en_cours',
  'en_attente',
  'accepte',
  'refuse',
  'cloture',
]);

// Table dossiers
export const dossiers = pgTable(
  'dossiers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    nom: text('nom').notNull(),
    prenom: text('prenom').notNull(),
    email: text('email').notNull(),
    telephone: text('telephone').notNull(),
    commune: text('commune').notNull(),
    typeDeBien: text('type_de_bien').notNull(),
    adresseComplete: text('adresse_complete'),
    numeroCadastre: text('numero_cadastre'),
    reference: text('reference').unique().notNull(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => sources.id),
    gestionnaireId: uuid('gestionnaire_id').references(() => users.id),
    statut: dossierStatutEnum('statut').default('nouveau').notNull(),
    etape: integer('etape').default(1).notNull(),
    etapeUpdatedAt: timestamp('etape_updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    hubspotDealId: text('hubspot_deal_id'),
    magicLinkToken: text('magic_link_token'),
    magicLinkExpiresAt: timestamp('magic_link_expires_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('dossiers_email_unique').using(
      'btree',
      sql`lower(trim(${table.email}))`,
    ),
    index('dossiers_dedup_secondary').using(
      'btree',
      sql`lower(trim(${table.telephone}))`,
      sql`lower(trim(${table.nom}))`,
      sql`lower(trim(${table.commune}))`,
    ),
  ],
);

// Table admin_invitations
export const adminInvitations = pgTable('admin_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  invitedBy: uuid('invited_by')
    .notNull()
    .references(() => users.id),
  token: text('token').unique().notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  usedAt: timestamp('used_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
