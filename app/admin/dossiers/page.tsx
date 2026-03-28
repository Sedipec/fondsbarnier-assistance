'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import DossierTable from '@/components/dossier/DossierTable';
import DossierFilters, {
  type DossierFiltersState,
} from '@/components/dossier/DossierFilters';
import DossierForm from '@/components/dossier/DossierForm';

interface Dossier {
  id: string;
  reference: string;
  nom: string;
  prenom: string;
  commune: string | null;
  etape: number;
  statut: string;
  createdAt: string;
}

interface Source {
  id: string;
  slug: string;
  label: string;
}

export default function AdminDossiersPage() {
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<DossierFiltersState>({
    search: '',
    etape: '',
    statut: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const limit = 20;

  const fetchDossiers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (filters.search) params.set('search', filters.search);
      if (filters.etape) params.set('etape', filters.etape);
      if (filters.statut) params.set('statut', filters.statut);

      const res = await fetch(`/api/v1/dossiers?${params}`);
      const data = await res.json();
      setDossiers(data.data || []);
      setTotalCount(data.count || 0);
    } catch {
      // Silencieux
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchDossiers();
  }, [fetchDossiers]);

  function handleFiltersChange(newFilters: DossierFiltersState) {
    setFilters(newFilters);
    setPage(1);

    // Debounce la recherche texte
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // Le useEffect sur filters se charge du fetch
    }, 300);
  }

  async function handleCreateDossier(formData: Record<string, string>) {
    setCreateLoading(true);
    setCreateError('');

    try {
      const res = await fetch('/api/v1/dossiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error || 'Erreur lors de la creation.');
        return;
      }

      setShowCreateModal(false);
      fetchDossiers();
    } catch {
      setCreateError('Erreur lors de la creation du dossier.');
    } finally {
      setCreateLoading(false);
    }
  }

  // Charger les sources a l'ouverture du modal
  useEffect(() => {
    if (showCreateModal && sources.length === 0) {
      // Les sources ne sont pas exposees par une API dediee,
      // on les code en dur (meme valeurs que le seed)
      setSources([
        { id: '', slug: 'portail', label: 'Portail client' },
        { id: '', slug: 'formulaire', label: 'Formulaire site vitrine' },
        { id: '', slug: 'appel', label: 'Appel telephonique' },
      ]);
    }
  }, [showCreateModal, sources.length]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Dossiers</h1>
          <span className="badge badge-neutral">{totalCount}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Nouveau dossier
        </button>
      </div>

      <div className="mb-4">
        <DossierFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <span className="loading loading-spinner loading-lg" />
            </div>
          ) : (
            <DossierTable
              dossiers={dossiers}
              page={page}
              totalCount={totalCount}
              limit={limit}
              onPageChange={setPage}
            />
          )}
        </div>
      </div>

      {/* Modal nouveau dossier */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="text-lg font-bold">Nouveau dossier</h3>

            {createError && (
              <div className="alert alert-error mt-4">
                <span>{createError}</span>
              </div>
            )}

            <DossierForm
              sources={sources}
              onSubmit={handleCreateDossier}
              loading={createLoading}
            />

            <button
              className="btn btn-ghost btn-sm absolute right-2 top-2"
              onClick={() => {
                setShowCreateModal(false);
                setCreateError('');
              }}
            >
              X
            </button>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => {
              setShowCreateModal(false);
              setCreateError('');
            }}
          />
        </div>
      )}
    </div>
  );
}
