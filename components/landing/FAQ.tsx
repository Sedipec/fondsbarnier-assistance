'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const questions = [
  {
    question: 'Qu\'est-ce que le Fonds Barnier ?',
    answer:
      'Le Fonds de Prevention des Risques Naturels Majeurs (Fonds Barnier) finance des mesures de prevention et d\'indemnisation pour les victimes de catastrophes naturelles, notamment les inondations. Il peut couvrir jusqu\'a 80% du cout des travaux de prevention.',
  },
  {
    question: 'Suis-je eligible a une subvention ?',
    answer:
      'Vous etes potentiellement eligible si votre commune a fait l\'objet d\'un arrete de catastrophe naturelle (Cat Nat) et que vous avez subi des dommages lies a l\'inondation. Notre equipe verifie votre eligibilite gratuitement sous 48h.',
  },
  {
    question: 'Combien coute votre service ?',
    answer:
      'Notre accompagnement est propose au forfait unique de 250 EUR TTC. Ce prix inclut la verification d\'eligibilite, la constitution complete du dossier, le depot aupres de la DDTM et le suivi jusqu\'a l\'obtention de la subvention.',
  },
  {
    question: 'Quels documents dois-je fournir ?',
    answer:
      'Les documents principaux sont : une attestation d\'assurance habitation, un releve cadastral, un RIB, des devis de travaux, un diagnostic inondation et une estimation de valeur venale. Nous vous guidons sur chaque document necessaire.',
  },
  {
    question: 'Combien de temps prend la procedure ?',
    answer:
      'Le delai d\'instruction par la DDTM est de 8 mois maximum. En amont, la verification d\'eligibilite prend 48h et la constitution du dossier quelques semaines selon la reactivite pour fournir les documents.',
  },
  {
    question: 'Que se passe-t-il si je ne suis pas eligible ?',
    answer:
      'La verification d\'eligibilite est gratuite. Si votre situation ne repond pas aux criteres du Fonds Barnier, nous vous en informons et vous orientons vers d\'autres dispositifs d\'aide eventuels.',
  },
  {
    question: 'Couvrez-vous toute la France ?',
    answer:
      'Oui, nous intervenons sur l\'ensemble du territoire francais. Notre expertise couvre toutes les communes ayant fait l\'objet d\'un arrete de catastrophe naturelle pour inondation.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-base-100 px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-14 text-center">
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Besoin d&apos;aide ?
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Questions frequentes
          </h2>
        </div>

        <div className="space-y-3">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-colors ${isOpen ? 'border-primary/20 bg-primary/5' : 'border-base-300/50 bg-base-100'}`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="pr-4 font-semibold">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="text-base-content/70 px-6 pb-5 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
