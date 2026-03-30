'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fba-onboarding-completed';
const TOTAL_STEPS = 3;

const steps = [
  {
    title: 'Bienvenue sur FondsBarnierAssistance',
    content: (
      <>
        <p className="text-base-content/70 mb-3">
          Notre plateforme vous accompagne dans la constitution et le suivi de
          votre dossier Fonds Barnier (Cat Nat) suite a un sinistre
          d&apos;inondation.
        </p>
        <p className="text-base-content/70">
          Nous simplifions chaque etape pour que vous puissiez vous concentrer
          sur l&apos;essentiel : la reconstruction de votre bien.
        </p>
      </>
    ),
  },
  {
    title: 'Votre dossier',
    content: (
      <>
        <p className="text-base-content/70 mb-3">
          Votre dossier suit un processus en <strong>10 etapes</strong>,
          reparties en 3 phases :
        </p>
        <ul className="text-base-content/70 mb-3 space-y-2">
          <li className="flex items-start gap-2">
            <span className="badge badge-primary badge-sm mt-1">1</span>
            <span>
              <strong>Qualification</strong> — Verification de votre
              eligibilite et collecte des premiers documents.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="badge badge-secondary badge-sm mt-1">2</span>
            <span>
              <strong>Engagement</strong> — Validation de votre dossier et
              signature du mandat d&apos;assistance.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="badge badge-accent badge-sm mt-1">3</span>
            <span>
              <strong>Instruction</strong> — Suivi aupres des autorites et
              obtention de l&apos;indemnisation.
            </span>
          </li>
        </ul>
        <p className="text-base-content/70">
          Vous pouvez suivre votre progression en temps reel depuis votre
          tableau de bord.
        </p>
      </>
    ),
  },
  {
    title: 'Besoin d&apos;aide ?',
    content: (
      <>
        <p className="text-base-content/70 mb-3">
          Notre equipe est disponible pour vous accompagner a chaque etape de
          votre dossier.
        </p>
        <p className="text-base-content/70 mb-3">
          <strong>Documents a preparer :</strong>
        </p>
        <ul className="text-base-content/70 mb-3 list-inside list-disc space-y-1">
          <li>Attestation d&apos;assurance habitation</li>
          <li>Releve cadastral du bien sinistre</li>
          <li>RIB pour le versement de l&apos;indemnisation</li>
          <li>Devis de remise en etat</li>
        </ul>
        <p className="text-base-content/70">
          Si vous avez des questions, n&apos;hesitez pas a nous contacter via
          la rubrique <strong>Support</strong> de votre espace.
        </p>
      </>
    ),
  },
];

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setOpen(false);
  };

  if (!open) return null;

  const currentStep = steps[step];

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="mb-4 text-lg font-bold">{currentStep.title}</h3>

        <div className="mb-6">{currentStep.content}</div>

        {/* Indicateurs de progression */}
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`inline-block h-2.5 w-2.5 rounded-full transition-colors ${
                i === step ? 'bg-primary' : 'bg-base-300'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="modal-action">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={handlePrev}>
              Precedent
            </button>
          )}
          <div className="flex-1" />
          {step < TOTAL_STEPS - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Suivant
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleFinish}>
              C&apos;est parti !
            </button>
          )}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={handleFinish}>fermer</button>
      </form>
    </dialog>
  );
}
