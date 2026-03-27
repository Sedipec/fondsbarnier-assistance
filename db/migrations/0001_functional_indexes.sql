-- Index fonctionnel unique sur email normalise (lower+trim)
-- Remplace l'index brut qui ne protege pas contre les doublons avec casse differente
DROP INDEX IF EXISTS "dossiers_email_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "dossiers_email_unique" ON "dossiers" USING btree (lower(trim("email")));--> statement-breakpoint

-- Index fonctionnel pour la dedup secondaire (telephone + nom + commune normalises)
-- Remplace l'index brut qui n'est pas utilise par les requetes avec lower(trim(...))
DROP INDEX IF EXISTS "dossiers_dedup_secondary";--> statement-breakpoint
CREATE INDEX "dossiers_dedup_secondary" ON "dossiers" USING btree (lower(trim("telephone")), lower(trim("nom")), lower(trim("commune")));
