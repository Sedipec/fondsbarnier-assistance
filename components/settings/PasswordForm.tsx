'use client';

import { useState } from 'react';

export default function PasswordForm() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Mot de passe modifié avec succès.');
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.error || 'Erreur lors du changement de mot de passe.');
      }
    } catch {
      setError('Erreur lors du changement de mot de passe.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label className="label" htmlFor="current-password">
          <span className="label-text">Mot de passe actuel</span>
        </label>
        <input
          id="current-password"
          type="password"
          className="input input-bordered w-full"
          value={form.currentPassword}
          onChange={(e) =>
            setForm({ ...form, currentPassword: e.target.value })
          }
          required
        />
      </div>

      <div className="form-control">
        <label className="label" htmlFor="new-password">
          <span className="label-text">Nouveau mot de passe</span>
        </label>
        <input
          id="new-password"
          type="password"
          className="input input-bordered w-full"
          minLength={8}
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
          required
        />
        <label className="label">
          <span className="label-text-alt">Minimum 8 caractères</span>
        </label>
      </div>

      <div className="form-control">
        <label className="label" htmlFor="confirm-password">
          <span className="label-text">Confirmer le nouveau mot de passe</span>
        </label>
        <input
          id="confirm-password"
          type="password"
          className="input input-bordered w-full"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          required
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
          'Changer le mot de passe'
        )}
      </button>
    </form>
  );
}
