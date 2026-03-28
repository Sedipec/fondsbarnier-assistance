'use client';

import { ETAPES, PHASE_COLORS } from '@/lib/dossier/etapes';

interface EtapeBadgeProps {
  etape: number;
  statut?: string;
}

export default function EtapeBadge({ etape, statut }: EtapeBadgeProps) {
  if (statut && statut !== 'actif') {
    const statutLabels: Record<string, string> = {
      suspendu: 'Suspendu',
      clos: 'Clos',
      non_eligible: 'Non eligible',
    };
    const statutColors: Record<string, string> = {
      suspendu: 'badge-warning',
      clos: 'badge-neutral',
      non_eligible: 'badge-error',
    };
    return (
      <span className={`badge ${statutColors[statut] ?? 'badge-ghost'}`}>
        {statutLabels[statut] ?? statut}
      </span>
    );
  }

  const etapeInfo = ETAPES.find((e) => e.num === etape);
  if (!etapeInfo) return <span className="badge badge-ghost">-</span>;

  const colorMap: Record<string, string> = {
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
  };

  const color =
    colorMap[PHASE_COLORS[etapeInfo.phase]] ?? 'badge-ghost';

  return (
    <span className={`badge ${color}`}>
      {etape}/10
    </span>
  );
}
