import { auth } from '@/utils/serverAuth';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await auth();

  return (
    <div className="bg-base-200 min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold">Tableau de bord admin</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Bienvenue</h2>
              <p className="text-base-content/70">
                Connecte en tant que {session?.user?.name}
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Utilisateurs</h2>
              <p className="text-base-content/70">
                Gerer les utilisateurs et les invitations
              </p>
              <div className="card-actions mt-4">
                <Link href="/admin/users" className="btn btn-primary btn-sm">
                  Voir les utilisateurs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
