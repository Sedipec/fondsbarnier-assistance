'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect.');
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
        <h2 className="card-title justify-center text-2xl">Connexion</h2>
        <p className="text-base-content/60 text-center text-sm">
          Connectez-vous à votre compte
        </p>

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
              placeholder="********"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div className="text-right">
            <Link
              href="/auth/reset-password"
              className="link link-primary text-sm"
            >
              Mot de passe oublie ?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="divider">OU</div>

        <button
          type="button"
          className="btn btn-outline w-full"
          onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
        >
          Continuer avec Google
        </button>

        <p className="mt-4 text-center text-sm">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="link link-primary">
            S&apos;inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
