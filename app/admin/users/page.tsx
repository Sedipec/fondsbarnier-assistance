'use client';

import { useEffect, useState, useCallback } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'client';
  isActive: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
      // Silencieux en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleToggleActive(userId: string, currentStatus: number) {
    try {
      await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: currentStatus ? 0 : 1 }),
      });
      fetchUsers();
    } catch {
      // Silencieux
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm('Etes-vous sur de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
      });
      fetchUsers();
    } catch {
      // Silencieux
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteLoading(true);
    setInviteMessage('');

    try {
      const res = await fetch('/api/v1/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setInviteMessage('Invitation envoyee avec succes.');
        setInviteEmail('');
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteMessage('');
        }, 2000);
      } else {
        setInviteMessage(data.error || "Erreur lors de l'envoi.");
      }
    } catch {
      setInviteMessage("Erreur lors de l'envoi de l'invitation.");
    } finally {
      setInviteLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="bg-base-200 min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">Utilisateurs</h1>
          <button
            className="btn btn-primary btn-sm md:btn-md"
            onClick={() => setShowInviteModal(true)}
          >
            Inviter un admin
          </button>
        </div>

        {/* Vue mobile : cards */}
        <div className="space-y-3 md:hidden">
          {users.map((user) => (
            <div key={user.id} className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{user.name || '-'}</p>
                  <div className="flex gap-1">
                    <span
                      className={`badge badge-sm ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}
                    >
                      {user.role}
                    </span>
                    <span
                      className={`badge badge-sm ${user.isActive ? 'badge-success' : 'badge-error'}`}
                    >
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </div>
                </div>
                <p className="text-base-content/60 text-sm">{user.email}</p>
                <p className="text-base-content/40 text-xs">
                  Inscrit le{' '}
                  {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    className={`btn btn-xs flex-1 ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                  >
                    {user.isActive ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    className="btn btn-error btn-xs flex-1"
                    onClick={() => handleDelete(user.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vue desktop : table */}
        <div className="bg-base-100 hidden overflow-x-auto rounded-lg shadow-xl md:block">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date d&apos;inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || '-'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td>
                    <span
                      className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}
                    >
                      {user.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDelete(user.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal invitation */}
        {showInviteModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="text-lg font-bold">Inviter un administrateur</h3>
              <form onSubmit={handleInvite} className="mt-4">
                <div className="form-control">
                  <label className="label" htmlFor="invite-email">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="admin@example.com"
                    className="input input-bordered w-full"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                {inviteMessage && (
                  <div
                    className={`alert mt-4 ${inviteMessage.includes('succes') ? 'alert-success' : 'alert-error'}`}
                  >
                    <span>{inviteMessage}</span>
                  </div>
                )}

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteMessage('');
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={inviteLoading}
                  >
                    {inviteLoading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      'Envoyer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
