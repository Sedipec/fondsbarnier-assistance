'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          Une erreur est survenue
        </h1>
        <p className="text-base-content/70 py-6 text-lg">
          Nous nous excusons pour le desagrement. Veuillez reessayer.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button onClick={reset} className="btn btn-primary">
            Reessayer
          </button>
          <Link href="/" className="btn btn-outline">
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
