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
  const [displaySearch, setDisplaySearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState('');
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
    const searchChanged = newFilters.search !== displaySearch;

    // Toujours mettre a jour l'affichage du champ de recherche immediatement
    setDisplaySearch(newFilters.search);

    if (searchChanged) {
      // Debounce le champ de recherche
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters({ ...newFilters });
        setPage(1);
      }, 300);
      // Appliquer les autres filtres immediatement si necessaire
      if (
        newFilters.etape !== filters.etape ||
        newFilters.statut !== filters.statut
      ) {
        setFilters((prev) => ({
          ...prev,
          etape: newFilters.etape,
          statut: newFilters.statut,
        }));
        setPage(1);
      }
    } else {
      // Pas de changement de recherche : appliquer immediatement
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setFilters(newFilters);
      setPage(1);
    }
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

  // Charger les sources depuis l'API a l'ouverture du modal
  const fetchSources = useCallback(async () => {
    setSourcesLoading(true);
    setSourcesError('');
    try {
      const res = await fetch('/api/v1/sources');
      const data = await res.json();
      if (!res.ok) {
        setSourcesError(data.error || 'Erreur lors du chargement des sources.');
        return;
      }
      if (data.data) setSources(data.data);
    } catch {
      setSourcesError(
        'Impossible de charger les sources. Verifiez votre connexion.',
      );
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showCreateModal && sources.length === 0) {
      fetchSources();
    }
  }, [showCreateModal, sources.length, fetchSources]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">Dossiers</h1>
          <span className="badge badge-neutral">{totalCount}</span>
        </div>
        <button
          className="btn btn-primary btn-sm md:btn-md"
          onClick={() => setShowCreateModal(true)}
        >
          + Nouveau dossier
        </button>
      </div>

      <div className="mb-4">
        <DossierFilters
          filters={{ ...filters, search: displaySearch }}
          onChange={handleFiltersChange}
        />
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
          <div className="modal-box max-h-[85vh] max-w-2xl overflow-y-auto [&]:[-webkit-overflow-scrolling:touch]">
            <h3 className="text-lg font-bold">Nouveau dossier</h3>

            {createError && (
              <div className="alert alert-error mt-4">
                <span>{createError}</span>
              </div>
            )}

            <DossierForm
              sources={sources}
              sourcesLoading={sourcesLoading}
              sourcesError={sourcesError}
              onRetrySources={fetchSources}
              onSubmit={handleCreateDossier}
              loading={createLoading}
            />

            <button
              className="btn btn-ghost btn-sm absolute top-2 right-2"
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
