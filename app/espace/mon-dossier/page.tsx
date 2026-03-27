import { auth } from '@/utils/serverAuth';

export default async function MonDossierPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">Mon dossier</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">
            Bienvenue, {session?.user?.name || 'Utilisateur'} !
          </h2>
          <p className="text-base-content/70">
            Votre espace personnel FondsBarnierAssistance. Constituez et suivez
            votre dossier Fonds Barnier.
          </p>
        </div>
      </div>
    </div>
  );
}
