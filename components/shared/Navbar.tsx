'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { Phone, Mail, Menu } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Ne pas afficher la navbar sur les pages avec sidebar
  const hasSidebar =
    pathname.startsWith('/admin') || pathname.startsWith('/espace');
  if (hasSidebar) return null;

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar contact */}
      <div className="bg-neutral text-neutral-content hidden text-sm sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5">
          <div className="flex items-center gap-5">
            <a
              href="mailto:contact@fondsbarnier.com"
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            >
              <Mail className="h-3.5 w-3.5" />
              contact@fondsbarnier.com
            </a>
            <a
              href="tel:+33188845252"
              className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
            >
              <Phone className="h-3.5 w-3.5" />
              01 88 84 52 52
            </a>
          </div>
          <span className="text-neutral-content/60">
            Lun - Ven : 9h - 17h15
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-base-100/95 border-base-300 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-content">FB</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-bold tracking-tight text-base-content">
                FondsBarnier
              </span>
              <span className="text-primary text-base font-light">
                Assistance
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 lg:flex">
            <NavLink href="/#services">Nos services</NavLink>
            <NavLink href="/#comment-ca-marche">Comment ca marche</NavLink>
            <NavLink href="/#temoignages">Temoignages</NavLink>
            <NavLink href="/#faq">FAQ</NavLink>
            <NavLink href="/about">A propos</NavLink>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 lg:flex">
            {session?.user ? (
              <>
                <Link
                  href={
                    session.user.role === 'admin'
                      ? '/admin/dashboard'
                      : '/espace/mon-dossier'
                  }
                  className="btn btn-ghost btn-sm"
                >
                  Mon espace
                </Link>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm">
                  Connexion
                </Link>
                <Link href="/demande" className="btn btn-primary btn-sm">
                  Obtenir un devis
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <div className="lg:hidden">
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                aria-label="Menu"
                className="btn btn-ghost btn-sm"
              >
                <Menu className="h-5 w-5" />
              </div>
              <ul
                tabIndex={0}
                className="menu dropdown-content rounded-box bg-base-100 z-10 mt-3 w-56 p-3 shadow-lg"
              >
                <li>
                  <Link href="/#services">Nos services</Link>
                </li>
                <li>
                  <Link href="/#comment-ca-marche">Comment ca marche</Link>
                </li>
                <li>
                  <Link href="/#temoignages">Temoignages</Link>
                </li>
                <li>
                  <Link href="/#faq">FAQ</Link>
                </li>
                <li>
                  <Link href="/about">A propos</Link>
                </li>
                <li className="mt-2 border-t pt-2">
                  {session?.user ? (
                    <>
                      <Link
                        href={
                          session.user.role === 'admin'
                            ? '/admin/dashboard'
                            : '/espace/mon-dossier'
                        }
                      >
                        Mon espace
                      </Link>
                      <SignOutButton />
                    </>
                  ) : (
                    <>
                      <Link href="/auth/login">Connexion</Link>
                      <Link
                        href="/demande"
                        className="btn btn-primary btn-sm mt-2"
                      >
                        Obtenir un devis
                      </Link>
                    </>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-base-content/70 hover:text-primary rounded-lg px-3 py-2 text-sm font-medium transition-colors"
    >
      {children}
    </Link>
  );
}
