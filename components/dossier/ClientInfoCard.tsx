'use client';

import { useState } from 'react';
import { Pencil, Save, X } from 'lucide-react';

interface ClientInfo {
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  commune: string | null;
  codePostal: string | null;
  cadastre: string | null;
}

interface ClientInfoCardProps {
  data: ClientInfo;
  dossierId: string;
  onUpdated: () => void;
}

const FIELDS: {
  key: keyof ClientInfo;
  label: string;
  type?: string;
  placeholder?: string;
}[] = [
  { key: 'nom', label: 'Nom', placeholder: 'Nom de famille' },
  { key: 'prenom', label: 'Prenom', placeholder: 'Prenom' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'email@exemple.com' },
  { key: 'telephone', label: 'Telephone', type: 'tel', placeholder: '06 12 34 56 78' },
  { key: 'adresse', label: 'Adresse', placeholder: '12 rue de la Paix' },
  { key: 'commune', label: 'Commune', placeholder: 'Nom de la commune' },
  { key: 'codePostal', label: 'Code postal', placeholder: '75001' },
  { key: 'cadastre', label: 'Cadastre', placeholder: 'Reference cadastrale' },
];

export default function ClientInfoCard({
  data,
  dossierId,
  onUpdated,
}: ClientInfoCardProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ClientInfo>({ ...data });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function startEdit() {
    setForm({ ...data });
    setError('');
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError('');
  }

  async function handleSave() {
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setError('Nom, prenom et email sont obligatoires.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          email: form.email.trim(),
          telephone: form.telephone?.trim() || null,
          adresse: form.adresse?.trim() || null,
          commune: form.commune?.trim() || null,
          codePostal: form.codePostal?.trim() || null,
          cadastre: form.cadastre?.trim() || null,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error || 'Erreur lors de la sauvegarde.');
        return;
      }

      setEditing(false);
      onUpdated();
    } catch {
      setError('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card bg-base-100 mb-6 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-lg">Informations client</h2>
          {!editing ? (
            <button
              className="btn btn-ghost btn-sm gap-1.5"
              onClick={startEdit}
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm gap-1"
                onClick={cancelEdit}
                disabled={saving}
              >
                <X className="h-4 w-4" />
                Annuler
              </button>
              <button
                className="btn btn-primary btn-sm gap-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Enregistrer
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mt-2 py-2 text-sm">{error}</div>
        )}

        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-base-content/60 mb-1 block text-sm">
                {field.label}
                {(field.key === 'nom' ||
                  field.key === 'prenom' ||
                  field.key === 'email') && (
                  <span className="text-error ml-0.5">*</span>
                )}
              </label>
              {editing ? (
                <input
                  type={field.type || 'text'}
                  className="input input-bordered input-sm w-full"
                  placeholder={field.placeholder}
                  value={form[field.key] ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [field.key]: e.target.value || null,
                    }))
                  }
                />
              ) : (
                <p className="font-medium">
                  {data[field.key] || (
                    <span className="text-base-content/30">-</span>
                  )}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
