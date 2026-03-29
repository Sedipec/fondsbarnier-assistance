'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import EtapeBadge from '@/components/dossier/EtapeBadge';
import EtapeTimeline from '@/components/dossier/EtapeTimeline';
import DocumentChecklist from '@/components/dossier/DocumentChecklist';
import NoteHistory from '@/components/dossier/NoteHistory';
import ProgressBar from '@/components/dossier/ProgressBar';
import ClientInfoCard from '@/components/dossier/ClientInfoCard';

interface DossierDetail {
  id: string;
  reference: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  commune: string | null;
  codePostal: string | null;
  cadastre: string | null;
  etape: number;
  statut: string;
  sourceId: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  documents: {
    id: string;
    type: string;
    label: string;
    received: boolean;
    receivedAt: string | null;
  }[];
  history: {
    id: string;
    type: string;
    content: string;
    authorId: string | null;
    createdAt: string;
  }[];
}

export default function AdminDossierDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dossierId = params.id as string;

  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDossier = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/dossiers/${dossierId}`);
      if (!res.ok) {
        router.push('/admin/dossiers');
        return;
      }
      const data = await res.json();
      setDossier(data.data);
    } catch {
      router.push('/admin/dossiers');
    } finally {
      setLoading(false);
    }
  }, [dossierId, router]);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  async function handleAdvanceEtape(newEtape: number) {
    if (
      !confirm(
        `Changer l'etape de ${dossier?.etape} a ${newEtape} ?`,
      )
    )
      return;

    setActionError(null);
    try {
      const res = await fetch(`/api/v1/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etape: newEtape }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Erreur lors du changement d\'etape.');
        return;
      }
      fetchDossier();
    } catch {
      setActionError('Erreur lors du changement d\'etape.');
    }
  }

  async function handleToggleDocument(docId: string, received: boolean) {
    setActionError(null);
    try {
      const res = await fetch(
        `/api/v1/dossiers/${dossierId}/documents/${docId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ received }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Erreur lors de la mise a jour du document.');
        return;
      }
      fetchDossier();
    } catch {
      setActionError('Erreur lors de la mise a jour du document.');
    }
  }

  async function handleAddNote(content: string) {
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/dossiers/${dossierId}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Erreur lors de l\'ajout de la note.');
        return;
      }
      fetchDossier();
    } catch {
      setActionError('Erreur lors de l\'ajout de la note.');
    }
  }

  async function handleChangeStatut(
    statut: 'actif' | 'suspendu' | 'clos' | 'non_eligible',
  ) {
    const labels: Record<string, string> = {
      suspendu: 'suspendre',
      clos: 'clore',
      actif: 'reactiver',
      non_eligible: 'marquer comme non eligible',
    };
    if (!confirm(`Voulez-vous ${labels[statut]} ce dossier ?`)) return;

    setActionError(null);
    try {
      const res = await fetch(`/api/v1/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setActionError(data.error || 'Erreur lors du changement de statut.');
        return;
      }
      fetchDossier();
    } catch {
      setActionError('Erreur lors du changement de statut.');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!dossier) return null;

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <button
          className="btn btn-ghost btn-sm mb-4"
          onClick={() => router.push('/admin/dossiers')}
        >
          <ArrowLeft className="h-4 w-4" />
          Dossiers
        </button>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{dossier.reference}</h1>
            <p className="text-base-content/70">
              {dossier.nom} {dossier.prenom}
              {dossier.commune ? ` — ${dossier.commune}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <EtapeBadge etape={dossier.etape} statut={dossier.statut} />
            {dossier.statut === 'actif' && (
              <>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleChangeStatut('suspendu')}
                >
                  Suspendre
                </button>
                <button
                  className="btn btn-neutral btn-sm"
                  onClick={() => handleChangeStatut('clos')}
                >
                  Clore
                </button>
              </>
            )}
            {dossier.statut === 'suspendu' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleChangeStatut('actif')}
              >
                Reactiver
              </button>
            )}
          </div>
        </div>
      </div>

      {actionError && (
        <div className="alert alert-error mb-6">
          <span>{actionError}</span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setActionError(null)}
          >
            X
          </button>
        </div>
      )}

      {/* Informations client */}
      <ClientInfoCard
        data={{
          nom: dossier.nom,
          prenom: dossier.prenom,
          email: dossier.email,
          telephone: dossier.telephone,
          adresse: dossier.adresse,
          commune: dossier.commune,
          codePostal: dossier.codePostal,
          cadastre: dossier.cadastre,
        }}
        dossierId={dossierId}
        onUpdated={fetchDossier}
      />

      {/* Progression */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg">Progression</h2>
          <div className="mb-4">
            <ProgressBar current={dossier.etape} total={10} />
          </div>

          {dossier.statut === 'actif' && (
            <div className="mb-4 flex gap-2">
              <button
                className="btn btn-outline btn-sm"
                disabled={dossier.etape <= 1}
                onClick={() =>
                  handleAdvanceEtape(dossier.etape - 1)
                }
              >
                Etape precedente
              </button>
              <button
                className="btn btn-primary btn-sm"
                disabled={dossier.etape >= 10}
                onClick={() =>
                  handleAdvanceEtape(dossier.etape + 1)
                }
              >
                Etape suivante
              </button>
            </div>
          )}

          <EtapeTimeline
            currentEtape={dossier.etape}
            history={dossier.history}
            compact
          />
        </div>
      </div>

      {/* Documents */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <DocumentChecklist
            documents={dossier.documents}
            onToggle={handleToggleDocument}
          />
        </div>
      </div>

      {/* Notes et historique */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <NoteHistory
            history={dossier.history}
            onAddNote={handleAddNote}
          />
        </div>
      </div>
    </div>
  );
}
