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
                  <td>
                    {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
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
