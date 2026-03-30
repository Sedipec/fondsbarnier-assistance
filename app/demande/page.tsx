import type { Metadata } from 'next';
import Footer from '@/components/landing/Footer';
import DemandeForm from './DemandeForm';

export const metadata: Metadata = {
  title: 'Faire une demande d\'assistance - FondsBarnierAssistance',
  description:
    'Faites votre demande d\'assistance Fonds Barnier pour votre sinistre inondation. Forfait unique de 250 EUR TTC, reponse sous 48h.',
};

export default function DemandePage() {
  return (
    <main>
      <section className="bg-gradient-to-b from-base-200/50 to-base-100 px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Faites votre demande d&apos;assistance Fonds Barnier
          </h1>
          <p className="text-base-content/70 mt-4 text-lg leading-relaxed">
            Remplissez le formulaire ci-dessous pour etre recontacte par notre
            equipe. Nous etudierons gratuitement votre eligibilite au Fonds
            Barnier (Cat Nat) et vous accompagnerons dans la constitution de
            votre dossier pour un forfait unique de{' '}
            <strong className="text-base-content">250 EUR TTC</strong>.
            Reponse sous 48 heures, sans engagement.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="card bg-base-100 border border-base-300 shadow-lg">
            <div className="card-body">
              <DemandeForm />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
