'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Mapping des segments d'URL vers des labels francais
const segmentLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Tableau de bord',
  dossiers: 'Dossiers',
  suivi: 'Suivi dossier',
  parametres: 'Paramètres',
  espace: 'Mon espace',
  'mon-dossier': 'Mon dossier',
  nouveau: 'Nouveau dossier',
  users: 'Utilisateurs',
};

// UUID pattern pour detecter les segments dynamiques
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getLabel(segment: string, prevSegment?: string): string {
  if (UUID_PATTERN.test(segment)) {
    if (prevSegment === 'dossiers') return 'Fiche dossier';
    return 'Detail';
  }
  return segmentLabels[segment] || decodeURIComponent(segment);
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Fil d'ariane" className="mb-6">
      <ol className="text-base-content/60 flex items-center gap-1.5 text-sm">
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const label = getLabel(segment, segments[index - 1]);

          return (
            <li key={href} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-base-content/30" aria-hidden="true">
                  &gt;
                </span>
              )}
              {isLast ? (
                <span className="text-base-content font-medium">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-base-content transition-colors"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
