'use client';

import { useEffect, useState } from 'react';

interface DossierFormProps {
  dossier?: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string | null;
    adresse?: string | null;
    commune?: string | null;
    codePostal?: string | null;
    cadastre?: string | null;
    sourceId?: string;
  };
  sources: { id: string; slug: string; label: string }[];
  sourcesLoading?: boolean;
  sourcesError?: string;
  onRetrySources?: () => void;
  onSubmit: (data: Record<string, string>) => void;
  loading?: boolean;
}

export default function DossierForm({
  dossier,
  sources,
  sourcesLoading = false,
  sourcesError = '',
  onRetrySources,
  onSubmit,
  loading = false,
}: DossierFormProps) {
  const [form, setForm] = useState({
    nom: dossier?.nom ?? '',
    prenom: dossier?.prenom ?? '',
    email: dossier?.email ?? '',
    telephone: dossier?.telephone ?? '',
    adresse: dossier?.adresse ?? '',
    commune: dossier?.commune ?? '',
    codePostal: dossier?.codePostal ?? '',
    cadastre: dossier?.cadastre ?? '',
    sourceId: dossier?.sourceId ?? sources[0]?.id ?? '',
  });

  // Synchroniser sourceId quand les sources sont chargees apres le montage
  useEffect(() => {
    if (!dossier && sources.length > 0 && !form.sourceId) {
      setForm((prev) => ({ ...prev, sourceId: sources[0].id }));
    }
  }, [sources, dossier, form.sourceId]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label" htmlFor="dossier-nom">
            <span className="label-text">Nom *</span>
          </label>
          <input
            id="dossier-nom"
            name="nom"
            type="text"
            className="input input-bordered w-full"
            value={form.nom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="dossier-prenom">
            <span className="label-text">Prenom *</span>
          </label>
          <input
            id="dossier-prenom"
            name="prenom"
            type="text"
            className="input input-bordered w-full"
            value={form.prenom}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="dossier-email">
          <span className="label-text">Email *</span>
        </label>
        <input
          id="dossier-email"
          name="email"
          type="email"
          className="input input-bordered w-full"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="dossier-telephone">
          <span className="label-text">Telephone</span>
        </label>
        <input
          id="dossier-telephone"
          name="telephone"
          type="tel"
          className="input input-bordered w-full"
          value={form.telephone}
          onChange={handleChange}
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="dossier-adresse">
          <span className="label-text">Adresse du bien sinistre</span>
        </label>
        <input
          id="dossier-adresse"
          name="adresse"
          type="text"
          className="input input-bordered w-full"
          value={form.adresse}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="form-control">
          <label className="label" htmlFor="dossier-commune">
            <span className="label-text">Commune</span>
          </label>
          <input
            id="dossier-commune"
            name="commune"
            type="text"
            className="input input-bordered w-full"
            value={form.commune}
            onChange={handleChange}
          />
        </div>
        <div className="form-control">
          <label className="label" htmlFor="dossier-codePostal">
            <span className="label-text">Code postal</span>
          </label>
          <input
            id="dossier-codePostal"
            name="codePostal"
            type="text"
            className="input input-bordered w-full"
            value={form.codePostal}
            onChange={handleChange}
          />
        </div>
      </div>

      {!dossier && (
        <div className="form-control">
          <label className="label" htmlFor="dossier-source">
            <span className="label-text">Source *</span>
          </label>
          {sourcesLoading ? (
            <div className="flex items-center gap-2 py-2">
              <span className="loading loading-spinner loading-sm" />
              <span className="text-base-content/60 text-sm">
                Chargement des sources...
              </span>
            </div>
          ) : sourcesError ? (
            <div className="flex flex-col gap-2">
              <p className="text-error text-sm">{sourcesError}</p>
              {onRetrySources && (
                <button
                  type="button"
                  className="btn btn-outline btn-error btn-sm w-fit"
                  onClick={onRetrySources}
                >
                  Reessayer
                </button>
              )}
            </div>
          ) : (
            <select
              id="dossier-source"
              name="sourceId"
              className="select select-bordered w-full"
              value={form.sourceId}
              onChange={handleChange}
              required
            >
              {sources.map((src) => (
                <option key={src.id} value={src.id}>
                  {src.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="modal-action">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : dossier ? (
            'Enregistrer'
          ) : (
            'Creer le dossier'
          )}
        </button>
      </div>
    </form>
  );
}
