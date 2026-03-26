# FondsBarnierAssistance

SaaS d'assistance aux sinistres d'inondation — aide les sinistres a constituer leur dossier Fonds Barnier (Cat Nat).

## Stack technique

- Next.js 15 (App Router)
- React 19
- TypeScript 5 (strict)
- Tailwind CSS 4 + DaisyUI 5
- Drizzle ORM + PostgreSQL
- NextAuth v5

## Demarrage

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Structure

```
app/              # Pages et API routes (App Router)
components/       # Composants React
hooks/            # Custom hooks (React Query)
lib/              # Utilitaires, config
packages/db/      # Schema Drizzle + queries
```

## Commandes

```bash
npm run dev           # Serveur de dev
npm run build         # Build production
npm run type-check    # Verification TypeScript
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Tests Vitest
```
