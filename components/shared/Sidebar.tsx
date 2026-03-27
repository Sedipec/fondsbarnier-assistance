'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import {
  LayoutGrid,
  FolderOpen,
  Search,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  dossierCount?: number;
}

const adminMainNav: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Dossiers', href: '/admin/dossiers', icon: FolderOpen },
  { label: 'Suivi dossier', href: '/admin/suivi', icon: Search },
];

const adminBottomNav: NavItem[] = [
  { label: 'Parametres', href: '/admin/parametres', icon: Settings },
];

const clientMainNav: NavItem[] = [
  { label: 'Mon dossier', href: '/espace/mon-dossier', icon: User },
];

const clientBottomNav: NavItem[] = [
  { label: 'Parametres', href: '/espace/parametres', icon: Settings },
];

function UserAvatar({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name || 'Avatar'}
        className="h-9 w-9 rounded-full object-cover"
        referrerPolicy="no-referrer"
      />
    );
  }

  // Placeholder avec initiales
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
      {initials}
    </div>
  );
}

function NavLink({
  item,
  isActive,
  dossierCount,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  dossierCount?: number;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const showBadge =
    item.href === '/admin/dossiers' && dossierCount !== undefined;

  return (
    <li className="group relative" title={item.label}>
      <Link
        href={item.href}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        {/* Trait lateral actif */}
        {isActive && (
          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white" />
        )}
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1">{item.label}</span>
        {showBadge && (
          <span className="badge badge-sm bg-white/20 text-white border-0">
            {dossierCount}
          </span>
        )}
      </Link>
      {/* Tooltip */}
      <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-gray-900 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 lg:hidden">
        {item.label}
      </div>
    </li>
  );
}

export default function Sidebar({ dossierCount }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!session?.user) return null;

  const isAdmin = session.user.role === 'admin';
  const mainNav = isAdmin ? adminMainNav : clientMainNav;
  const bottomNav = isAdmin ? adminBottomNav : clientBottomNav;
  const sectionLabel = isAdmin ? 'PRINCIPAL' : 'MON ESPACE';

  // Ajouter le badge compteur aux dossiers admin
  const mainNavWithBadge = mainNav.map((item) =>
    item.href === '/admin/dossiers' ? { ...item, badge: dossierCount } : item,
  );

  const isActive = (href: string) => {
    if (href === pathname) return true;
    // Activer le parent si on est sur une sous-route
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="border-b border-white/10 px-5 py-6">
        <Link href="/" className="block">
          <h1 className="text-lg font-bold leading-tight text-white">
            Fonds Barnier Assistance
          </h1>
          <p className="mt-0.5 text-xs font-medium tracking-wider text-white/50">
            BY SEDIPEC
          </p>
        </Link>
        {/* Badge role */}
        <span className="mt-3 inline-block rounded-full bg-white/15 px-3 py-0.5 text-xs font-medium text-white">
          {isAdmin ? 'Administrateur' : 'Client'}
        </span>
      </div>

      {/* Navigation principale */}
      <nav className="flex flex-1 flex-col px-3 py-4" aria-label="Navigation principale">
        <p className="mb-2 px-3 text-[11px] font-semibold tracking-widest text-white/40">
          {sectionLabel}
        </p>
        <ul className="space-y-1">
          {mainNavWithBadge.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              dossierCount={dossierCount}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </ul>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation bas */}
        <ul className="space-y-1">
          {bottomNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isActive(item.href)}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </ul>
      </nav>

      {/* Bloc utilisateur */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar name={session.user.name} image={session.user.image} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {session.user.name || 'Utilisateur'}
            </p>
            <p className="truncate text-xs text-white/50">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-lg p-1.5 text-white/50 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Se deconnecter"
            title="Se deconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-gray-900 p-2 text-white shadow-lg lg:hidden"
        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col bg-gray-900 lg:flex">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-gray-900 transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
