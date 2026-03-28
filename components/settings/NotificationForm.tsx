'use client';

import { useState, useEffect } from 'react';

interface NotificationPreferences {
  email: boolean;
  dossierUpdates: boolean;
  newsletter: boolean;
}

export default function NotificationForm() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email: true,
    dossierUpdates: true,
    newsletter: false,
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
        if (res.ok && data.data?.notificationPreferences) {
          setPrefs(data.data.notificationPreferences);
        }
      } catch {
        setError('Impossible de charger les preferences.');
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
        body: JSON.stringify({ notificationPreferences: prefs }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Preferences mises a jour.');
      } else {
        setError(data.error || 'Erreur lors de la mise a jour.');
      }
    } catch {
      setError('Erreur lors de la mise a jour.');
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
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={prefs.email}
            onChange={(e) => setPrefs({ ...prefs, email: e.target.checked })}
          />
          <div>
            <span className="label-text font-medium">
              Notifications par email
            </span>
            <p className="text-base-content/60 text-sm">
              Recevoir les notifications importantes par email
            </p>
          </div>
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={prefs.dossierUpdates}
            onChange={(e) =>
              setPrefs({ ...prefs, dossierUpdates: e.target.checked })
            }
          />
          <div>
            <span className="label-text font-medium">
              Mises a jour du dossier
            </span>
            <p className="text-base-content/60 text-sm">
              Etre notifie des changements sur votre dossier
            </p>
          </div>
        </label>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={prefs.newsletter}
            onChange={(e) =>
              setPrefs({ ...prefs, newsletter: e.target.checked })
            }
          />
          <div>
            <span className="label-text font-medium">Newsletter</span>
            <p className="text-base-content/60 text-sm">
              Recevoir les actualites et informations
            </p>
          </div>
        </label>
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
          'Enregistrer les preferences'
        )}
      </button>
    </form>
  );
}
