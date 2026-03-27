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

  const navLinks = (
    <>
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
    </>
  );

  return (
    <nav className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">
          FondsBarnierAssistance
        </Link>
      </div>
      {/* Menu desktop */}
      <div className="hidden gap-2 lg:flex">
        <ul className="menu menu-horizontal px-1">{navLinks}</ul>
        {session?.user && (
          <>
            <span className="text-base-content/70 text-sm">
              {session.user.name}
            </span>
            <SignOutButton />
          </>
        )}
      </div>
      {/* Menu burger mobile */}
      <div className="flex-none lg:hidden">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu dropdown-content menu-sm rounded-box bg-base-100 z-10 mt-3 w-52 p-2 shadow"
          >
            {navLinks}
            {session?.user && (
              <>
                <li className="menu-title">
                  <span>{session.user.name}</span>
                </li>
                <li>
                  <SignOutButton />
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
