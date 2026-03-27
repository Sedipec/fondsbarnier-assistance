'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          inviteToken: inviteToken || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error || "Une erreur est survenue lors de l'inscription.",
        );
        setLoading(false);
        return;
      }

      // Connexion automatique apres inscription
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Inscription reussie. Veuillez vous connecter.');
        router.push('/auth/login');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card bg-base-100 w-full max-w-md shadow-xl">
      <div className="card-body">
        <h2 className="card-title justify-center text-2xl">Inscription</h2>
        <p className="text-base-content/60 text-center text-sm">
          {inviteToken
            ? 'Creez votre compte administrateur'
            : 'Creez votre compte pour commencer'}
        </p>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="form-control">
            <label className="label" htmlFor="name">
              <span className="label-text">Nom complet</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jean Dupont"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">Email</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="password">
              <span className="label-text">Mot de passe</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 caracteres"
              className="input input-bordered w-full"
              minLength={8}
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="confirmPassword">
              <span className="label-text">Confirmer le mot de passe</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="********"
              className="input input-bordered w-full"
              minLength={8}
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
              "S'inscrire"
            )}
          </button>
        </form>

        {!inviteToken && (
          <>
            <div className="divider">OU</div>

            <button
              type="button"
              className="btn btn-outline w-full"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              Continuer avec Google
            </button>
          </>
        )}

        <p className="mt-4 text-center text-sm">
          Deja un compte ?{' '}
          <Link href="/auth/login" className="link link-primary">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
