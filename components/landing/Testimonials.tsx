const testimonials = [
  {
    name: 'Marie L.',
    city: 'Nemours (77)',
    text: 'Grace a cette plateforme, j&apos;ai pu constituer mon dossier Fonds Barnier en quelques jours seulement. Un vrai gain de temps apres une periode deja difficile.',
  },
  {
    name: 'Jean-Pierre D.',
    city: 'Lourdes (65)',
    text: 'Le suivi etape par etape m&apos;a permis de ne rien oublier dans mes demarches. Mon dossier a ete accepte du premier coup.',
  },
  {
    name: 'Sophie M.',
    city: 'Vaison-la-Romaine (84)',
    text: 'Apres l&apos;inondation, on ne sait pas par ou commencer. Cette application m&apos;a guidee du debut a la fin. Je recommande vivement.',
  },
];

export default function Testimonials() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Ils nous font confiance
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card card-compact bg-base-100 shadow">
              <div className="card-body">
                <p className="text-base-content/70">
                  &laquo; {testimonial.text} &raquo;
                </p>
                <div className="mt-2">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-base-content/50 text-sm">
                    {testimonial.city}
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
