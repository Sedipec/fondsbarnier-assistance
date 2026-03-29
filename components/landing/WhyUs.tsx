import { Clock, UserCheck, Award, TrendingUp } from 'lucide-react';

const reasons = [
  {
    icon: Clock,
    title: 'Reponse sous 48h',
    description:
      'Votre eligibilite est verifiee en moins de 48 heures. Pas d\'attente inutile.',
  },
  {
    icon: UserCheck,
    title: 'Accompagnement personnalise',
    description:
      'Un interlocuteur dedie qui connait votre dossier et vous guide a chaque etape.',
  },
  {
    icon: Award,
    title: 'Expertise reconnue',
    description:
      'Plus de 500 dossiers traites avec succes aupres des services de l\'Etat.',
  },
  {
    icon: TrendingUp,
    title: 'Jusqu\'a 80% de subvention',
    description:
      'Le Fonds Barnier peut financer jusqu\'a 80% de vos travaux de prevention.',
  },
];

export default function WhyUs() {
  return (
    <section className="bg-base-100 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Nos engagements
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Pourquoi nous choisir ?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div key={reason.title} className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <reason.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-bold">{reason.title}</h3>
              <p className="text-base-content/60 text-sm leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
