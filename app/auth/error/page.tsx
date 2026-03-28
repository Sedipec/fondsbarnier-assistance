'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const errorMessages: Record<string, string> = {
  Configuration:
    'Un probleme de configuration du serveur empeche la connexion. Veuillez contacter le support.',
  AccessDenied:
    'Vous n\'avez pas l\'autorisation d\'acceder a cette ressource.',
  Verification:
    'Le lien de verification a expire ou a deja ete utilise.',
  OAuthSignin:
    'Impossible d\'initier la connexion avec le fournisseur OAuth. Veuillez reessayer.',
  OAuthCallback:
    'Une erreur est survenue lors du retour du fournisseur OAuth. Veuillez reessayer.',
  OAuthCreateAccount:
    'Impossible de creer un compte avec ce fournisseur OAuth. L\'email est peut-etre deja utilise.',
  OAuthAccountNotLinked:
    'Cet email est deja associe a un autre mode de connexion. Utilisez votre methode de connexion habituelle.',
  CredentialsSignin:
    'Email ou mot de passe incorrect. Veuillez verifier vos identifiants.',
  SessionRequired:
    'Vous devez etre connecte pour acceder a cette page.',
  Default:
    'Une erreur inattendue est survenue. Veuillez reessayer.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') ?? 'Default';
  const message = errorMessages[errorType] ?? errorMessages['Default'];

  return (
    <div className="card bg-base-100 w-full max-w-md shadow-xl">
      <div className="card-body items-center text-center">
        <h2 className="card-title text-2xl text-error">
          Erreur d&apos;authentification
        </h2>

        <p className="text-base-content/70 mt-2">{message}</p>

        <div className="card-actions mt-6 w-full flex-col gap-2">
          <Link href="/auth/login" className="btn btn-primary w-full">
            Retour a la connexion
          </Link>
          <Link href="/" className="btn btn-ghost w-full">
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="card bg-base-100 w-full max-w-md shadow-xl">
          <div className="card-body items-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
