import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'A propos - FondsBarnierAssistance',
  description:
    'Decouvrez FondsBarnierAssistance, la plateforme qui vous accompagne dans la constitution de votre dossier Fonds Barnier.',
};

export default function AboutPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          A propos de FondsBarnierAssistance
        </h1>
        <p className="text-base-content/70 py-6 text-lg">
          FondsBarnierAssistance est une plateforme en ligne concue pour
          accompagner les victimes de sinistres d&apos;inondation dans la
          constitution et le suivi de leur dossier Fonds Barnier (Cat Nat).
          Notre objectif est de simplifier les demarches administratives et de
          vous guider pas a pas pour obtenir l&apos;indemnisation a laquelle
          vous avez droit.
        </p>
        <Link href="/" className="btn btn-primary">
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
