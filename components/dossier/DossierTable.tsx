'use client';

import { useRouter } from 'next/navigation';
import EtapeBadge from './EtapeBadge';

interface Dossier {
  id: string;
  reference: string;
  nom: string;
  prenom: string;
  commune?: string | null;
  etape: number;
  statut: string;
  createdAt: string | Date;
}

interface DossierTableProps {
  dossiers: Dossier[];
  page: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function DossierCard({
  dossier,
  onClick,
}: {
  dossier: Dossier;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-base-100 active:bg-base-200 cursor-pointer border-b p-4 transition-colors last:border-b-0"
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-base-content/60 font-mono text-xs">
          {dossier.reference}
        </span>
        <EtapeBadge etape={dossier.etape} statut={dossier.statut} />
      </div>
      <p className="font-medium">
        {dossier.nom} {dossier.prenom}
      </p>
      <div className="text-base-content/60 mt-1 flex items-center justify-between text-sm">
        <span>{dossier.commune ?? '-'}</span>
        <span>{new Date(dossier.createdAt).toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
  );
}

export default function DossierTable({
  dossiers,
  page,
  totalCount,
  limit,
  onPageChange,
}: DossierTableProps) {
  const router = useRouter();
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      {/* Vue mobile : liste de cards */}
      <div className="md:hidden">
        {dossiers.length === 0 ? (
          <p className="text-base-content/50 p-6 text-center">
            Aucun dossier trouve.
          </p>
        ) : (
          dossiers.map((d) => (
            <DossierCard
              key={d.id}
              dossier={d}
              onClick={() => router.push(`/admin/dossiers/${d.id}`)}
            />
          ))
        )}
      </div>

      {/* Vue desktop : table classique */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Client</th>
                <th>Commune</th>
                <th>Etape</th>
                <th>Date creation</th>
              </tr>
            </thead>
            <tbody>
              {dossiers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-base-content/50 text-center">
                    Aucun dossier trouve.
                  </td>
                </tr>
              ) : (
                dossiers.map((d) => (
                  <tr
                    key={d.id}
                    className="hover cursor-pointer"
                    onClick={() => router.push(`/admin/dossiers/${d.id}`)}
                  >
                    <td className="font-mono text-sm">{d.reference}</td>
                    <td>
                      {d.nom} {d.prenom}
                    </td>
                    <td>{d.commune ?? '-'}</td>
                    <td>
                      <EtapeBadge etape={d.etape} statut={d.statut} />
                    </td>
                    <td>{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center p-4 md:p-0">
          <div className="join">
            <button
              className="join-item btn btn-sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Precedent
            </button>
            <button className="join-item btn btn-sm btn-disabled">
              Page {page} / {totalPages}
            </button>
            <button
              className="join-item btn btn-sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
