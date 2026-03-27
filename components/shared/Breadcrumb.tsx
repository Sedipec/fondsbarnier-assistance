'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Mapping des segments d'URL vers des labels francais
const segmentLabels: Record<string, string> = {
  admin: 'Admin',
  dashboard: 'Tableau de bord',
  dossiers: 'Dossiers',
  suivi: 'Suivi dossier',
  parametres: 'Parametres',
  espace: 'Mon espace',
  'mon-dossier': 'Mon dossier',
};

function getLabel(segment: string): string {
  return segmentLabels[segment] || decodeURIComponent(segment);
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Fil d'ariane" className="mb-6">
      <ol className="flex items-center gap-1.5 text-sm text-base-content/60">
        {segments.map((segment, index) => {
          const href = '/' + segments.slice(0, index + 1).join('/');
          const isLast = index === segments.length - 1;
          const label = getLabel(segment);

          return (
            <li key={href} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-base-content/30" aria-hidden="true">
                  &gt;
                </span>
              )}
              {isLast ? (
                <span className="font-medium text-base-content">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="transition-colors hover:text-base-content"
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
