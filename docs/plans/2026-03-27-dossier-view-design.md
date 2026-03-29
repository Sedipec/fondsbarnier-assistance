## Contexte

Le SaaS fondsbarnier-assistance gere des dossiers de sinistre inondation pour le Fonds Barnier. Les pages `/espace/mon-dossier` et `/admin/dossiers` existent mais sont des placeholders vides. Aucune table `dossiers` n'existe dans le schema Drizzle.

## Objectif

Implementer la vue dossier complete V1 : modele de donnees, API REST, vue client (timeline + action), vue admin (table + fiche detaillee).

---

## 1. Modele de donnees (Drizzle - `db/schema.ts`)

### Table `sources` (referentiel)
- `id` serial PK
- `name` text unique - valeurs: `portail`, `formulaire`, `appel`

### Table `dossiers`
- `id` uuid PK (default random)
- `reference` text unique - format `FB-AAAA-NNNN` auto-genere via compteur annuel en transaction (pg_advisory_xact_lock)
- `userId` uuid FK -> users, nullable (dossier cree par admin avant inscription client)
- `sourceId` int FK -> sources
- `nom`, `prenom` text not null
- `email` text not null - index unique fonctionnel sur `lower(trim(email))` pour dedup
- `telephone` text
- `adresse` text - adresse du bien sinistre
- `commune` text
- `codePostal` text
- `cadastre` text nullable
- `statut` enum(`actif`, `suspendu`, `clos`, `non_eligible`) default `actif`
- `etape` integer default 1 (valeurs 1-10)
- `etapeUpdatedAt` timestamp
- `createdAt`, `updatedAt` timestamps

Index composite secondaire sur `(lower(telephone), lower(nom), lower(commune))` pour dedup warning.

### Table `dossier_documents` (checklist)
- `id` uuid PK
- `dossierId` uuid FK -> dossiers (cascade delete)
- `type` enum(`assurance`, `cadastre`, `rib`, `devis`, `diagnostic`, `valeur_venale`, `autre`)
- `label` text - libelle affiche
- `received` boolean default false
- `receivedAt` timestamp nullable
- `fileUrl` text nullable - prepare pour upload S3 en V2, non utilise pour l'instant

### Table `dossier_history` (notes + transitions)
- `id` uuid PK
- `dossierId` uuid FK -> dossiers (cascade delete)
- `type` enum(`note`, `etape_change`, `document`, `creation`)
- `content` text
- `authorId` uuid FK -> users
- `createdAt` timestamp

### Migration
Generer la migration Drizzle (`npx drizzle-kit generate`) et l'appliquer (`npx drizzle-kit migrate`).

Seed: inserer les 3 sources (`portail`, `formulaire`, `appel`).

---

## 2. Constantes etapes (`lib/dossier/etapes.ts`)

```typescript
export const ETAPES = [
  { num: 1, label: 'Formulaire recu', phase: 'qualification' },
  { num: 2, label: 'Demande infos cadastrales', phase: 'qualification' },
  { num: 3, label: 'Infos recues du client', phase: 'qualification' },
  { num: 4, label: 'Verification eligibilite DDTM', phase: 'qualification' },
  { num: 5, label: 'Email eligibilite + presentation devis', phase: 'engagement' },
  { num: 6, label: 'Signature devis (250 EUR TTC)', phase: 'engagement' },
  { num: 7, label: 'Collecte des pieces justificatives', phase: 'engagement' },
  { num: 8, label: 'Depot dossier DDTM', phase: 'instruction' },
  { num: 9, label: 'Instruction (8 mois max)', phase: 'instruction' },
  { num: 10, label: 'Subvention accordee', phase: 'instruction' },
] as const

export const PHASE_COLORS = {
  qualification: 'info',
  engagement: 'success',
  instruction: 'warning',
} as const
```

---

## 3. Service dossier (`lib/dossier/service.ts`)

Fonctions :
- `createDossier(data)` - genere la reference FB-AAAA-NNNN en transaction, cree les documents par defaut (assurance, cadastre, rib, devis, diagnostic, valeur_venale), ajoute une entree historique `creation`
- `getDossierById(id)` - avec documents et historique (joins)
- `getDossierByUserId(userId)` - pour le client (retourne son dossier ou null)
- `listDossiers({ etape?, statut?, search?, page?, limit? })` - pour la table admin avec pagination
- `updateDossier(id, data)` - modifier les infos
- `advanceEtape(id, newEtape, authorId)` - changer d'etape + entree historique `etape_change`
- `toggleDocument(docId, received, authorId)` - cocher/decocher + entree historique `document`
- `addNote(dossierId, content, authorId)` - entree historique `note`

---

## 4. API Routes

| Methode | Route | Role | Description |
|---------|-------|------|-------------|
| `GET` | `/api/v1/dossiers` | admin | Liste paginee avec filtres `?etape=4&statut=actif&search=dupont&page=1&limit=20` |
| `GET` | `/api/v1/dossiers/me` | client | Mon dossier (via session userId), retourne le dossier + documents + historique, ou 404 |
| `POST` | `/api/v1/dossiers` | admin, client | Creer un dossier. Client: associe automatiquement son userId. Admin: peut specifier un userId |
| `GET` | `/api/v1/dossiers/[id]` | admin | Fiche complete (dossier + documents + historique) |
| `PATCH` | `/api/v1/dossiers/[id]` | admin | Modifier infos ou changer etape (si `etape` est dans le body, appeler `advanceEtape`) |
| `PATCH` | `/api/v1/dossiers/[id]/documents/[docId]` | admin | `{ received: true/false }` |
| `POST` | `/api/v1/dossiers/[id]/history` | admin | `{ content: "Appel DDTM..." }` ajouter une note |

Verification d'auth sur toutes les routes. Format de reponse : `{ data, count? }` ou `{ error }`.

---

## 5. Vue Client - `/espace/mon-dossier/page.tsx`

### Si le client n'a pas de dossier :
- Message "Vous n'avez pas encore de dossier"
- Bouton "Soumettre une demande" -> formulaire de creation

### Si le client a un dossier :

**Bloc d'action** (card DaisyUI avec bg colore) en haut :
- Texte dynamique selon l'etape courante (ex: etape 3 -> "Transmettez votre adresse et numero de cadastre")
- Bouton CTA si une action client est attendue

**Barre de progression** :
- Pourcentage `etape / 10 * 100`
- Barre DaisyUI progress ou barre custom Tailwind

**Timeline verticale** (`EtapeTimeline` component) :
- Etapes passees : icone check vert + date
- Etape courante : icone cercle bleu + "En cours"
- Etapes futures : icone cercle gris
- Chaque etape affiche son label

**Checklist documents** (`DocumentChecklist` component) :
- Liste des documents avec checkbox (lecture seule pour le client)
- Badge compteur "2/7 recus"

---

## 6. Vue Admin - `/admin/dossiers/page.tsx`

**Header** : titre "Dossiers" + badge compteur + bouton "+ Nouveau dossier"

**Filtres** (`DossierFilters` component) :
- Input recherche (nom, email, commune, reference) - debounce 300ms
- Select etape (Toutes / 1-10)
- Select statut (Tous / actif / suspendu / clos / non_eligible)

**Table** (`DossierTable` component, DaisyUI table) :
- Colonnes : Reference, Client (nom prenom), Commune, Etape (badge colore `EtapeBadge`), Date creation
- Tri par clic sur colonne
- Pagination (20 par page)
- Clic sur une ligne -> navigation vers `/admin/dossiers/[id]`

**Modal nouveau dossier** : formulaire `DossierForm` dans un modal DaisyUI. Champs : nom, prenom, email, telephone, adresse, commune, code postal, source (select).

---

## 7. Vue Admin - `/admin/dossiers/[id]/page.tsx`

**Header** :
- Bouton retour "<- Dossiers"
- Reference FB-XXXX-XXXX
- Nom client + commune
- Badge etape courante
- Boutons : "Editer" (modal), "Clore" / "Suspendre" (change statut)

**Section Informations client** :
- Grid 2 colonnes avec toutes les infos (nom, prenom, email, tel, adresse, commune, CP, cadastre, source)

**Section Progression** :
- Timeline compacte (meme `EtapeTimeline` que le client)
- Boutons "<- Etape precedente" et "Etape suivante ->" pour avancer/reculer
- Confirmation avant changement d'etape

**Section Documents** :
- `DocumentChecklist` avec checkboxes cliquables (l'admin coche quand il recoit un document)
- Badge compteur "3/7"

**Section Notes et historique** :
- Liste chronologique inversee (plus recent en haut)
- Icones par type : note, etape_change, document, creation
- Input + bouton "Ajouter une note"

---

## 8. Composants partages (`components/dossier/`)

| Composant | Props | Description |
|-----------|-------|-------------|
| `EtapeTimeline` | `currentEtape`, `history[]`, `compact?` | Timeline verticale des 10 etapes |
| `EtapeBadge` | `etape`, `statut` | Badge colore par phase |
| `ActionBanner` | `etape`, `statut` | Bloc d'action contextuel client |
| `DocumentChecklist` | `documents[]`, `readonly?`, `onToggle?` | Liste de documents avec checkboxes |
| `DossierTable` | `dossiers[]`, `onSort?` | Table admin |
| `DossierFilters` | `filters`, `onChange` | Barre de filtres |
| `DossierForm` | `dossier?`, `onSubmit` | Formulaire creation/edition |
| `NoteHistory` | `history[]`, `onAddNote?` | Notes et historique |
| `ProgressBar` | `current`, `total` | Barre de progression |

---

## 9. Contraintes techniques

- **UI** : DaisyUI 5 + Tailwind CSS, coherent avec les pages admin/users existantes
- **Conventions** : UI et textes en francais, code en anglais, commits conventionnels en anglais
- **Auth** : verifier le role sur chaque route API (admin ou client selon la route)
- **Dedup** : index unique fonctionnel sur `lower(trim(email))`, warning (pas bloquant) sur le composite secondaire
- **Reference** : generation thread-safe via `pg_advisory_xact_lock` dans une transaction
- **Pas de notification email** dans cette V1
- **Pas d'upload de fichier** dans cette V1 (juste checklist)
- **Breadcrumb** : mettre a jour le mapping dans `Breadcrumb.tsx` pour les nouvelles routes

## 10. Quality gates

- `npm run type-check` - pas d'erreur TypeScript
- `npm run lint` - pas de warning ESLint
- `npm run test` - tests unitaires pour le service dossier + tests API routes
- `npm run build` - build Next.js reussi
