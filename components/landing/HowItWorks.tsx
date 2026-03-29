import { ClipboardList, FileSearch, Send, BadgeCheck } from 'lucide-react';

const steps = [
  {
    icon: ClipboardList,
    title: 'Decrivez votre sinistre',
    description:
      'Remplissez un formulaire simple pour decrire votre situation et les dommages subis lors de l\'inondation.',
  },
  {
    icon: FileSearch,
    title: 'Verification d\'eligibilite',
    description:
      'Nos experts verifient votre eligibilite aupres de la DDTM et vous informent sous 48h.',
  },
  {
    icon: Send,
    title: 'Constitution du dossier',
    description:
      'Nous constituons votre dossier complet et le deposons aupres des services competents.',
  },
  {
    icon: BadgeCheck,
    title: 'Subvention obtenue',
    description:
      'Suivez l\'avancement en temps reel. Subventions pouvant couvrir jusqu\'a 80% des travaux.',
  },
];

export default function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="bg-base-100 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Simple et rapide
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Comment ca marche ?
          </h2>
          <p className="text-base-content/60 mx-auto mt-4 max-w-2xl text-lg">
            Un processus clair en 4 etapes pour obtenir votre subvention Fonds
            Barnier.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="group relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute top-10 left-[calc(50%+2rem)] hidden h-0.5 w-[calc(100%-4rem)] bg-gradient-to-r from-primary/30 to-primary/10 lg:block" />
              )}
              <div className="card bg-base-200/50 hover:bg-base-200 border border-base-300/50 hover:border-primary/20 h-full transition-all duration-300 hover:shadow-lg">
                <div className="card-body items-center text-center">
                  <div className="relative mb-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content shadow-md">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="card-title text-base">{step.title}</h3>
                  <p className="text-base-content/60 text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
