import { auth } from '@/utils/serverAuth';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="bg-base-200 min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">
              Bienvenue, {session?.user?.name || 'Utilisateur'} !
            </h2>
            <p className="text-base-content/70">
              Votre espace personnel FondsBarnierAssistance. Constituez et
              suivez votre dossier Fonds Barnier.
            </p>
            <div className="card-actions mt-6">
              <Link href="/demande" className="btn btn-primary">
                Faire une demande
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
