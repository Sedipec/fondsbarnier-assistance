'use client';

import { ETAPES } from '@/lib/dossier/etapes';

export interface DossierFiltersState {
  search: string;
  etape: string;
  statut: string;
}

interface DossierFiltersProps {
  filters: DossierFiltersState;
  onChange: (filters: DossierFiltersState) => void;
}

export default function DossierFilters({
  filters,
  onChange,
}: DossierFiltersProps) {
  function handleChange(field: keyof DossierFiltersState, value: string) {
    onChange({ ...filters, [field]: value });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      <input
        type="text"
        className="input input-bordered input-sm w-full md:w-64"
        placeholder="Rechercher (nom, email, commune, ref.)..."
        value={filters.search}
        onChange={(e) => handleChange('search', e.target.value)}
      />
      <div className="flex gap-3">
        <select
          className="select select-bordered select-sm flex-1 md:flex-none"
          value={filters.etape}
          onChange={(e) => handleChange('etape', e.target.value)}
        >
          <option value="">Toutes les etapes</option>
          {ETAPES.map((e) => (
            <option key={e.num} value={String(e.num)}>
              {e.num}. {e.label}
            </option>
          ))}
        </select>
        <select
          className="select select-bordered select-sm flex-1 md:flex-none"
          value={filters.statut}
          onChange={(e) => handleChange('statut', e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
          <option value="clos">Clos</option>
          <option value="non_eligible">Non eligible</option>
        </select>
      </div>
    </div>
  );
}
