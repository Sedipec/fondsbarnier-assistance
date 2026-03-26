import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Nous rejoindre - FondsBarnierAssistance',
  description:
    'Decouvrez les avantages de rejoindre FondsBarnierAssistance pour vous accompagner dans vos demarches Fonds Barnier.',
};

export default function JoinUsPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          Pourquoi nous rejoindre ?
        </h1>
        <p className="text-base-content/70 py-6 text-lg">
          En rejoignant FondsBarnierAssistance, vous beneficiez d&apos;un
          accompagnement personnalise pour constituer votre dossier Fonds
          Barnier. Notre plateforme simplifie chaque etape de vos demarches
          administratives, vous fait gagner un temps precieux et maximise vos
          chances d&apos;obtenir une indemnisation juste. Rejoignez des milliers
          de sinistres qui nous font deja confiance.
        </p>
        <Link href="/" className="btn btn-primary">
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
