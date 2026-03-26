# CLAUDE.md — FondsBarnierAssistance

## Projet

SaaS Next.js 15 pour l'assistance aux sinistres d'inondation. Aide les sinistres a constituer et suivre leur dossier Fonds Barnier (Cat Nat).

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript 5 (strict)
- Tailwind CSS 4 + DaisyUI 5 + Shadcn/Radix UI
- TanStack React Query 5
- Drizzle ORM + PostgreSQL
- NextAuth v5 (JWT)

## Conventions

- Langue UI/erreurs/toasts : francais
- Langue code (variables, fonctions) : anglais
- Langue commentaires : francais
- Langue commits : anglais (conventional commits)
- Pas d'emojis sauf demande explicite
- 2 espaces d'indentation, single quotes, trailing commas

## API Routes (`app/api/v1/`)

- Auth via `auth()` de `@/utils/serverAuth`
- Reponses : `{ data: [...], count: N }` ou `{ error: 'Message' }`
- Erreurs en francais

## Commandes de validation

```bash
npm run type-check    # TypeScript
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Vitest
npm run build         # Build production
```
