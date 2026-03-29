'use client';

import { useState } from 'react';
import { ETAPES, PHASE_COLORS } from '@/lib/dossier/etapes';

interface ActionBannerProps {
  etape: number;
  statut: string;
  dossierId?: string;
  paidAt?: string | null;
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

export default function ActionBanner({ etape, statut, dossierId, paidAt }: ActionBannerProps) {
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
        {etape === 6 && dossierId && !paidAt && (
          <PayButton dossierId={dossierId} />
        )}
        {etape === 6 && paidAt && (
          <div className="badge badge-success mt-2">Paiement confirme</div>
        )}
      </div>
    </div>
  );
}

function PayButton({ dossierId }: { dossierId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePay() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la creation du paiement.');
        return;
      }
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3">
      {error && (
        <div className="alert alert-error mb-2 py-2 text-sm">
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Signer et payer mon devis (250 EUR)'
        )}
      </button>
    </div>
  );
}
