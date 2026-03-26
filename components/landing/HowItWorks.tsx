const steps = [
  {
    number: '1',
    title: 'Decrivez votre sinistre',
    description:
      'Remplissez un formulaire simple pour decrire votre situation et les dommages subis.',
  },
  {
    number: '2',
    title: 'Constituez votre dossier',
    description:
      'Ajoutez vos pieces justificatives. Nous vous guidons sur les documents necessaires.',
  },
  {
    number: '3',
    title: 'Suivez votre demande',
    description:
      'Suivez l&apos;avancement de votre dossier en temps reel et recevez des notifications.',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-base-100 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Comment ca marche ?
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="card bg-base-200 shadow-sm">
              <div className="card-body items-center text-center">
                <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold">
                  {step.number}
                </div>
                <h3 className="card-title mt-4">{step.title}</h3>
                <p className="text-base-content/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
