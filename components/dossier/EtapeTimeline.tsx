'use client';

import { ETAPES, PHASE_COLORS } from '@/lib/dossier/etapes';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface HistoryEntry {
  type: string;
  content: string;
  createdAt: string | Date;
}

interface EtapeTimelineProps {
  currentEtape: number;
  history?: HistoryEntry[];
  compact?: boolean;
}

export default function EtapeTimeline({
  currentEtape,
  history = [],
  compact = false,
}: EtapeTimelineProps) {
  // Trouver les dates de passage a chaque etape depuis l'historique
  const etapeDates: Record<number, string> = {};
  for (const entry of history) {
    if (entry.type === 'etape_change') {
      // Format: "Etape X → Y"
      const match = entry.content.match(/→\s*(\d+)/);
      if (match) {
        const toEtape = Number(match[1]);
        etapeDates[toEtape] = new Date(entry.createdAt).toLocaleDateString(
          'fr-FR',
        );
      }
    }
    if (entry.type === 'creation') {
      etapeDates[1] = new Date(entry.createdAt).toLocaleDateString('fr-FR');
    }
  }

  const colorMap: Record<string, string> = {
    info: 'text-info',
    success: 'text-success',
    warning: 'text-warning',
  };

  return (
    <ul className={`space-y-${compact ? '2' : '4'}`}>
      {ETAPES.map((etape) => {
        const isPast = etape.num < currentEtape;
        const isCurrent = etape.num === currentEtape;
        const phaseColor =
          colorMap[PHASE_COLORS[etape.phase]] ?? 'text-base-content';

        return (
          <li key={etape.num} className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">
              {isPast ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : isCurrent ? (
                <Clock className={`h-5 w-5 ${phaseColor}`} />
              ) : (
                <Circle className="text-base-content/30 h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  isPast
                    ? 'text-base-content/60 line-through'
                    : isCurrent
                      ? `font-semibold ${phaseColor}`
                      : 'text-base-content/40'
                }`}
              >
                {etape.num}. {etape.label}
              </p>
              {!compact && (
                <p className="text-base-content/50 text-xs">
                  {isPast && etapeDates[etape.num]
                    ? etapeDates[etape.num]
                    : isCurrent
                      ? 'En cours'
                      : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
