'use client';

import { ETAPES, PHASE_COLORS } from '@/lib/dossier/etapes';

interface ActionBannerProps {
  etape: number;
  statut: string;
}

// Messages d'action personnalises par etape
const ACTION_MESSAGES: Record<number, string> = {
  1: 'Votre formulaire a ete recu. Nous allons bientot vous contacter.',
  2: 'Nous avons besoin de vos informations cadastrales. Veuillez les transmettre.',
  3: 'Transmettez votre adresse et numero de cadastre.',
  4: 'Votre eligibilite est en cours de verification aupres de la DDTM.',
  5: 'Vous etes eligible ! Consultez le devis qui vous a ete envoye par email.',
  6: 'Signez le devis (250 EUR TTC) pour demarrer la constitution du dossier.',
  7: 'Nous collectons vos pieces justificatives. Verifiez la checklist ci-dessous.',
  8: 'Votre dossier a ete depose aupres de la DDTM.',
  9: "Votre dossier est en cours d'instruction. Delai maximum : 8 mois.",
  10: 'Felicitations ! Votre subvention Fonds Barnier a ete accordee.',
};

export default function ActionBanner({ etape, statut }: ActionBannerProps) {
  if (statut !== 'actif') {
    const messages: Record<string, string> = {
      suspendu: 'Votre dossier est temporairement suspendu. Contactez-nous pour plus d\'informations.',
      clos: 'Votre dossier a ete clos.',
      non_eligible: 'Votre bien n\'est malheureusement pas eligible au Fonds Barnier.',
    };
    return (
      <div className="alert alert-warning">
        <span>{messages[statut] ?? 'Statut inconnu'}</span>
      </div>
    );
  }

  const etapeInfo = ETAPES.find((e) => e.num === etape);
  const message = ACTION_MESSAGES[etape] ?? '';

  const bgColors: Record<string, string> = {
    info: 'bg-info/10 border-info/30',
    success: 'bg-success/10 border-success/30',
    warning: 'bg-warning/10 border-warning/30',
  };

  const phase = etapeInfo?.phase ?? 'qualification';
  const bgColor =
    bgColors[PHASE_COLORS[phase]] ?? 'bg-base-200';

  return (
    <div className={`card border ${bgColor}`}>
      <div className="card-body p-4">
        <h3 className="card-title text-base">
          Etape {etape} — {etapeInfo?.label}
        </h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
