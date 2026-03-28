'use client';

import { useState, useEffect } from 'react';

interface ProfileData {
  name: string | null;
  email: string;
  phone: string | null;
}

export default function ProfileForm() {
  const [form, setForm] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/v1/profile');
        const data = await res.json();
        if (res.ok && data.data) {
          setForm({
            name: data.data.name || '',
            email: data.data.email || '',
            phone: data.data.phone || '',
          });
        }
      } catch {
        setError('Impossible de charger le profil.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/v1/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Profil mis à jour avec succès.');
      } else {
        setError(data.error || 'Erreur lors de la mise à jour.');
      }
    } catch {
      setError('Erreur lors de la mise à jour du profil.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-md"></span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label" htmlFor="profile-name">
          <span className="label-text">Nom complet</span>
        </label>
        <input
          id="profile-name"
          type="text"
          className="input input-bordered w-full"
          value={form.name || ''}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="profile-email">
          <span className="label-text">Email</span>
        </label>
        <input
          id="profile-email"
          type="email"
          className="input input-bordered w-full"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="profile-phone">
          <span className="label-text">Téléphone</span>
        </label>
        <input
          id="profile-phone"
          type="tel"
          className="input input-bordered w-full"
          placeholder="+33 6 12 34 56 78"
          value={form.phone || ''}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
      </div>

      {message && (
        <div className="alert alert-success">
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          'Enregistrer'
        )}
      </button>
    </form>
  );
}
