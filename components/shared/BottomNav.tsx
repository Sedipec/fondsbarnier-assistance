'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutGrid,
  FolderOpen,
  Search,
  Settings,
  User,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNav: NavItem[] = [
  { label: 'Accueil', href: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Dossiers', href: '/admin/dossiers', icon: FolderOpen },
  { label: 'Suivi', href: '/admin/suivi', icon: Search },
  { label: 'Parametres', href: '/admin/parametres', icon: Settings },
];

const clientNav: NavItem[] = [
  { label: 'Mon dossier', href: '/espace/mon-dossier', icon: User },
  { label: 'Parametres', href: '/espace/parametres', icon: Settings },
];

export default function BottomNav() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session?.user) return null;

  const isAdmin = session.user.role === 'admin';
  const items = isAdmin ? adminNav : clientNav;

  const isActive = (href: string) => {
    if (href === pathname) return true;
    if (pathname.startsWith(href + '/')) return true;
    return false;
  };

  return (
    <nav
      className="bg-base-100 fixed inset-x-0 bottom-0 z-50 border-t border-base-300 lg:hidden"
      aria-label="Navigation mobile"
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-base-content/50 active:text-primary'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
