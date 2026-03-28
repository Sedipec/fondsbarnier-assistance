import { auth } from '@/utils/serverAuth';

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">Tableau de bord</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Bienvenue</h2>
            <p className="text-base-content/70">
              Connecté en tant que {session?.user?.name}
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Dossiers</h2>
            <p className="text-base-content/70">
              Statistiques globales des dossiers
            </p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Utilisateurs</h2>
            <p className="text-base-content/70">
              Gérer les utilisateurs et les invitations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
