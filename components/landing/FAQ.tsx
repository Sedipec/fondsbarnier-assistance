const questions = [
  {
    question: 'Qu&apos;est-ce que le Fonds Barnier ?',
    answer:
      'Le Fonds de Prevention des Risques Naturels Majeurs (Fonds Barnier) finance des mesures de prevention et d&apos;indemnisation pour les victimes de catastrophes naturelles, notamment les inondations.',
  },
  {
    question: 'Suis-je eligible a une indemnisation ?',
    answer:
      'Vous etes potentiellement eligible si votre commune a fait l&apos;objet d&apos;un arrete de catastrophe naturelle (Cat Nat) et que vous avez subi des dommages lies a l&apos;inondation.',
  },
  {
    question: 'Quels documents dois-je fournir ?',
    answer:
      'Les documents principaux sont : une piece d&apos;identite, un justificatif de domicile, des photos des dommages, les devis ou factures de reparation, et votre attestation d&apos;assurance habitation.',
  },
  {
    question: 'Combien de temps prend la procedure ?',
    answer:
      'Le delai varie selon la complexite du dossier et la reactivite des organismes. En general, comptez entre 2 et 6 mois apres le depot d&apos;un dossier complet.',
  },
  {
    question: 'Le service est-il gratuit ?',
    answer:
      'L&apos;utilisation de la plateforme pour constituer et suivre votre dossier est entierement gratuite. Nous sommes la pour simplifier vos demarches.',
  },
];

export default function FAQ() {
  return (
    <section className="bg-base-200 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-12 text-center text-3xl font-bold">
          Questions frequentes
        </h2>
        <div className="space-y-2">
          {questions.map((item, index) => (
            <div key={index} className="collapse-arrow bg-base-100 collapse">
              <input
                type="radio"
                name="faq-accordion"
                defaultChecked={index === 0}
              />
              <div className="collapse-title font-semibold">
                {item.question}
              </div>
              <div className="collapse-content">
                <p className="text-base-content/70">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
