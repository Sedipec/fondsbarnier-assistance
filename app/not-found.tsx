import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable',
};

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-3xl font-bold md:text-4xl">
          Page introuvable
        </h2>
        <p className="text-base-content/70 py-6 text-lg">
          La page que vous recherchez n&apos;existe pas ou a ete deplacee.
        </p>
        <Link href="/" className="btn btn-primary">
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
