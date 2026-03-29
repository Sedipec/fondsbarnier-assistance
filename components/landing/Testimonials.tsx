import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Marie Dupont',
    location: 'Pas-de-Calais (62)',
    text: 'Apres les inondations de novembre, je ne savais pas par ou commencer. L\'equipe m\'a guidee du debut a la fin. Ma subvention a ete accordee en 6 mois.',
    rating: 5,
    initials: 'MD',
  },
  {
    name: 'Pierre Lambert',
    location: 'Somme (80)',
    text: 'Service professionnel et reactif. Ils ont constitue mon dossier rapidement et j\'ai pu lancer mes travaux de protection grace a la subvention obtenue.',
    rating: 5,
    initials: 'PL',
  },
  {
    name: 'Sophie Bertrand',
    location: 'Aisne (02)',
    text: 'Je recommande vivement. Les demarches administratives sont complexes mais avec leur aide, tout s\'est deroule sans stress. Merci pour votre accompagnement.',
    rating: 5,
    initials: 'SB',
  },
];

export default function Testimonials() {
  return (
    <section
      id="temoignages"
      className="bg-base-200 px-4 py-20 sm:px-6 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Ils nous font confiance
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Temoignages</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="card bg-base-100 border border-base-300/50 shadow-sm"
            >
              <div className="card-body p-6">
                <Quote className="mb-2 h-8 w-8 text-primary/20" />
                <p className="text-base-content/80 text-sm leading-relaxed italic">
                  &quot;{t.text}&quot;
                </p>
                <div className="mt-4 flex items-center gap-3 border-t border-base-300/50 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-base-content/50 text-xs">{t.location}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
