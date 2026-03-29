'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Si pas de token/email, afficher le formulaire "mot de passe oublie"
  if (!token || !email) {
    return <ForgotPasswordForm />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title justify-center text-2xl">
            Mot de passe modifie
          </h2>
          <p className="text-base-content/60 mt-2">
            Votre mot de passe a ete reinitialise avec succes.
          </p>
          <Link href="/auth/login" className="btn btn-primary mt-4">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 w-full max-w-md shadow-xl">
      <div className="card-body">
        <h2 className="card-title justify-center text-2xl">
          Nouveau mot de passe
        </h2>
        <p className="text-base-content/60 text-center text-sm">
          Choisissez votre nouveau mot de passe
        </p>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="password">
              <span className="label-text">Nouveau mot de passe</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 caracteres"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="confirmPassword">
              <span className="label-text">Confirmer le mot de passe</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirmez votre mot de passe"
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Reinitialiser le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="card bg-base-100 w-full max-w-md shadow-xl">
        <div className="card-body text-center">
          <h2 className="card-title justify-center text-2xl">Email envoye</h2>
          <p className="text-base-content/60 mt-2">
            Si un compte existe avec cet email, vous recevrez un lien de
            reinitialisation.
          </p>
          <Link href="/auth/login" className="btn btn-ghost mt-4">
            Retour a la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 w-full max-w-md shadow-xl">
      <div className="card-body">
        <h2 className="card-title justify-center text-2xl">
          Mot de passe oublie
        </h2>
        <p className="text-base-content/60 text-center text-sm">
          Entrez votre email pour recevoir un lien de reinitialisation
        </p>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="forgot-email">
              <span className="label-text">Email</span>
            </label>
            <input
              id="forgot-email"
              type="email"
              placeholder="votre@email.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Envoyer le lien'
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="link link-primary">
            Retour a la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
