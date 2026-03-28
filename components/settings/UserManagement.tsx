'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'admin' | 'client';
  isActive: number;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/users');
      const data = await res.json();
      setUsers(data.data || []);
    } catch {
      // Silencieux
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

  async function handleRoleChange(userId: string, newRole: 'admin' | 'client') {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch {
      // Silencieux
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
    <div className="space-y-4">
      <p className="text-base-content/60 text-sm">
        {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistre
        {users.length > 1 ? 's' : ''}
      </p>

      {/* Vue mobile : cards */}
      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{user.name || '-'}</p>
                <span
                  className={`badge badge-sm ${user.isActive ? 'badge-success' : 'badge-error'}`}
                >
                  {user.isActive ? 'Actif' : 'Desactive'}
                </span>
              </div>
              <p className="text-base-content/60 text-sm">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <select
                  className="select select-bordered select-sm flex-1"
                  value={user.role}
                  onChange={(e) =>
                    handleRoleChange(
                      user.id,
                      e.target.value as 'admin' | 'client',
                    )
                  }
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                  onClick={() => handleToggleActive(user.id, user.isActive)}
                >
                  {user.isActive ? 'Desactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Vue desktop : table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Role</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    className="select select-bordered select-sm"
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(
                        user.id,
                        e.target.value as 'admin' | 'client',
                      )
                    }
                  >
                    <option value="client">Client</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <span
                    className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}
                  >
                    {user.isActive ? 'Actif' : 'Desactive'}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <button
                    className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                  >
                    {user.isActive ? 'Desactiver' : 'Activer'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
