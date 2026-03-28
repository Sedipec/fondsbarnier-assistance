'use client';

import { useEffect, useState, useCallback } from 'react';
import ActionBanner from '@/components/dossier/ActionBanner';
import ProgressBar from '@/components/dossier/ProgressBar';
import EtapeTimeline from '@/components/dossier/EtapeTimeline';
import DocumentChecklist from '@/components/dossier/DocumentChecklist';

interface DossierDetail {
  id: string;
  reference: string;
  nom: string;
  prenom: string;
  email: string;
  etape: number;
  statut: string;
  createdAt: string;
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
    createdAt: string;
  }[];
}

export default function MonDossierPage() {
  const [dossier, setDossier] = useState<DossierDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchDossier = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/dossiers/me');
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      setDossier(data.data);
    } catch {
      // Silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (notFound || !dossier) {
    return (
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Mon dossier</h1>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body text-center">
            <p className="text-base-content/70 mb-4">
              Vous n&apos;avez pas encore de dossier.
            </p>
            <div>
              <a href="/espace/mon-dossier/nouveau" className="btn btn-primary">
                Soumettre une demande
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-3xl font-bold">Mon dossier</h1>
      <p className="text-base-content/60 mb-6 font-mono text-sm">
        {dossier.reference}
      </p>

      {/* Bloc d'action */}
      <div className="mb-6">
        <ActionBanner etape={dossier.etape} statut={dossier.statut} />
      </div>

      {/* Barre de progression */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg">Progression</h2>
          <ProgressBar current={dossier.etape} total={10} />
        </div>
      </div>

      {/* Timeline */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg">Suivi des etapes</h2>
          <EtapeTimeline
            currentEtape={dossier.etape}
            history={dossier.history}
          />
        </div>
      </div>

      {/* Checklist documents */}
      <div className="card bg-base-100 mb-6 shadow-xl">
        <div className="card-body">
          <DocumentChecklist documents={dossier.documents} readonly />
        </div>
      </div>
    </div>
  );
}
