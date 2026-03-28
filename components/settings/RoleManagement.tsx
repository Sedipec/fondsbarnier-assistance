'use client';

const roles = [
  {
    name: 'Administrateur',
    slug: 'admin',
    description:
      'Acces complet : gestion des dossiers, utilisateurs, parametres et configuration.',
    permissions: [
      'Gestion des dossiers',
      'Gestion des utilisateurs',
      "Parametres de l'application",
      'Invitations admin',
      'Suivi des dossiers',
    ],
  },
  {
    name: 'Client',
    slug: 'client',
    description: 'Acces limite : consultation et suivi de son propre dossier.',
    permissions: [
      'Consultation de son dossier',
      'Modification de son profil',
      'Gestion de ses notifications',
    ],
  },
];

export default function RoleManagement() {
  return (
    <div className="space-y-4">
      {roles.map((role) => (
        <div key={role.slug} className="card bg-base-200">
          <div className="card-body p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{role.name}</h3>
              <span className="badge badge-outline badge-sm">{role.slug}</span>
            </div>
            <p className="text-base-content/60 text-sm">{role.description}</p>
            <div className="mt-2">
              <p className="mb-1 text-sm font-medium">Permissions :</p>
              <ul className="list-inside list-disc space-y-0.5 text-sm">
                {role.permissions.map((perm) => (
                  <li key={perm} className="text-base-content/70">
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
