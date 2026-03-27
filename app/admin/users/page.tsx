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
    <div className="bg-base-200 min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowInviteModal(true)}
          >
            Inviter un admin
          </button>
        </div>

        <div className="bg-base-100 overflow-x-auto rounded-lg shadow-xl">
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
                      {user.isActive ? 'Actif' : 'Desactive'}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    <button
                      className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                      onClick={() => handleToggleActive(user.id, user.isActive)}
                    >
                      {user.isActive ? 'Desactiver' : 'Activer'}
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
