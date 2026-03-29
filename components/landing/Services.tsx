import {
  Search,
  FolderOpen,
  Send,
  HeadphonesIcon,
  Banknote,
  Users,
  ShieldCheck,
  Wrench,
} from 'lucide-react';

const services = [
  {
    icon: Search,
    title: 'Verification d\'eligibilite',
    description:
      'Analyse de votre situation et verification des criteres d\'eligibilite aupres de la DDTM.',
  },
  {
    icon: FolderOpen,
    title: 'Constitution du dossier',
    description:
      'Rassemblement et organisation de toutes les pieces justificatives necessaires.',
  },
  {
    icon: Send,
    title: 'Depot du dossier DDTM',
    description:
      'Soumission officielle de votre dossier complet aupres des services competents.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Suivi administratif',
    description:
      'Accompagnement personnalise tout au long de la procedure d\'instruction.',
  },
  {
    icon: Banknote,
    title: 'Aide a l\'avance de frais',
    description:
      'Orientation vers des solutions de financement pour lancer les travaux rapidement.',
  },
  {
    icon: Users,
    title: 'Reseau d\'experts',
    description:
      'Mise en relation avec des professionnels qualifies pour les diagnostics et travaux.',
  },
  {
    icon: ShieldCheck,
    title: 'Conseils de protection',
    description:
      'Recommandations pour proteger votre bien contre les futurs risques d\'inondation.',
  },
  {
    icon: Wrench,
    title: 'Suivi post-subvention',
    description:
      'Accompagnement apres l\'obtention pour la realisation des travaux de prevention.',
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-base-200 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Notre expertise
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Nos services</h2>
          <p className="text-base-content/60 mx-auto mt-4 max-w-2xl text-lg">
            Un accompagnement complet pour simplifier vos demarches et maximiser
            vos chances d&apos;obtenir votre subvention.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="card bg-base-100 border border-base-300/50 transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
            >
              <div className="card-body p-5">
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold">{service.title}</h3>
                <p className="text-base-content/60 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
