-- Migration V2 : refonte dossiers + ajout dossier_documents et dossier_history

-- Nouveaux enums
CREATE TYPE "public"."document_type" AS ENUM('assurance', 'cadastre', 'rib', 'devis', 'diagnostic', 'valeur_venale', 'autre');--> statement-breakpoint
CREATE TYPE "public"."history_type" AS ENUM('note', 'etape_change', 'document', 'creation');--> statement-breakpoint

-- Supprimer les anciennes contraintes et index de la table dossiers
DROP INDEX IF EXISTS "dossiers_email_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "dossiers_dedup_secondary";--> statement-breakpoint
ALTER TABLE "dossiers" DROP CONSTRAINT IF EXISTS "dossiers_gestionnaire_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "dossiers" DROP CONSTRAINT IF EXISTS "dossiers_source_id_sources_id_fk";--> statement-breakpoint

-- Supprimer les anciennes colonnes
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "type_de_bien";--> statement-breakpoint
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "adresse_complete";--> statement-breakpoint
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "numero_cadastre";--> statement-breakpoint
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "gestionnaire_id";--> statement-breakpoint
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "hubspot_deal_id";--> statement-breakpoint
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "magic_link_token";--> statement-breakpoint
ALTER TABLE "dossiers" DROP COLUMN IF EXISTS "magic_link_expires_at";--> statement-breakpoint

-- Ajouter les nouvelles colonnes
ALTER TABLE "dossiers" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "dossiers" ADD COLUMN "adresse" text;--> statement-breakpoint
ALTER TABLE "dossiers" ADD COLUMN "code_postal" text;--> statement-breakpoint
ALTER TABLE "dossiers" ADD COLUMN "cadastre" text;--> statement-breakpoint

-- Rendre telephone et commune nullable
ALTER TABLE "dossiers" ALTER COLUMN "telephone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dossiers" ALTER COLUMN "commune" DROP NOT NULL;--> statement-breakpoint

-- Rendre etape_updated_at nullable (pas de default now)
ALTER TABLE "dossiers" ALTER COLUMN "etape_updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "dossiers" ALTER COLUMN "etape_updated_at" DROP DEFAULT;--> statement-breakpoint

-- Changer l'enum statut : creer le nouvel enum, convertir, supprimer l'ancien
CREATE TYPE "public"."dossier_statut_v2" AS ENUM('actif', 'suspendu', 'clos', 'non_eligible');--> statement-breakpoint
ALTER TABLE "dossiers" ALTER COLUMN "statut" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "dossiers" ALTER COLUMN "statut" TYPE "public"."dossier_statut_v2" USING (
  CASE "statut"::text
    WHEN 'nouveau' THEN 'actif'
    WHEN 'en_cours' THEN 'actif'
    WHEN 'en_attente' THEN 'suspendu'
    WHEN 'accepte' THEN 'actif'
    WHEN 'refuse' THEN 'non_eligible'
    WHEN 'cloture' THEN 'clos'
    ELSE 'actif'
  END::"public"."dossier_statut_v2"
);--> statement-breakpoint
ALTER TABLE "dossiers" ALTER COLUMN "statut" SET DEFAULT 'actif';--> statement-breakpoint
DROP TYPE "public"."dossier_statut";--> statement-breakpoint
ALTER TYPE "public"."dossier_statut_v2" RENAME TO "dossier_statut";--> statement-breakpoint

-- Ajouter les FK
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossiers" ADD CONSTRAINT "dossiers_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint

-- Recreer les index fonctionnels
CREATE UNIQUE INDEX "dossiers_email_unique" ON "dossiers" USING btree (lower(trim("email")));--> statement-breakpoint
CREATE INDEX "dossiers_dedup_secondary" ON "dossiers" USING btree (lower("telephone"), lower("nom"), lower("commune"));--> statement-breakpoint

-- Table dossier_documents
CREATE TABLE "dossier_documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "dossier_id" uuid NOT NULL,
  "type" "document_type" NOT NULL,
  "label" text NOT NULL,
  "received" boolean DEFAULT false NOT NULL,
  "received_at" timestamp,
  "file_url" text
);--> statement-breakpoint
ALTER TABLE "dossier_documents" ADD CONSTRAINT "dossier_documents_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Table dossier_history
CREATE TABLE "dossier_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "dossier_id" uuid NOT NULL,
  "type" "history_type" NOT NULL,
  "content" text NOT NULL,
  "author_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "dossier_history" ADD CONSTRAINT "dossier_history_dossier_id_dossiers_id_fk" FOREIGN KEY ("dossier_id") REFERENCES "public"."dossiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dossier_history" ADD CONSTRAINT "dossier_history_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
