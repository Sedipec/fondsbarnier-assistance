'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Ne pas afficher la navbar sur les pages avec sidebar
  const hasSidebar =
    pathname.startsWith('/admin') || pathname.startsWith('/espace');
  if (hasSidebar) return null;

  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          FondsBarnierAssistance
        </Link>
      </div>
      <div className="flex-none gap-2">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/about">A propos</Link>
          </li>
          {session?.user ? (
            <li>
              <Link
                href={
                  session.user.role === 'admin'
                    ? '/admin/dashboard'
                    : '/espace/mon-dossier'
                }
              >
                Mon espace
              </Link>
            </li>
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
        {session?.user && (
          <>
            <span className="text-base-content/70 text-sm">
              {session.user.name}
            </span>
            <SignOutButton />
          </>
        )}
      </div>
    </nav>
  );
}
