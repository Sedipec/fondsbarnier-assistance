'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          FondsBarnierAssistance
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/about">A propos</Link>
          </li>
          {session?.user ? (
            <>
              <li>
                <Link
                  href={session.user.role === 'admin' ? '/admin' : '/dashboard'}
                >
                  Mon espace
                </Link>
              </li>
              <li>
                <SignOutButton />
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/auth/login">Connexion</Link>
              </li>
              <li>
                <Link href="/auth/register">Inscription</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}
