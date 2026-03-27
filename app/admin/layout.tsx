import { auth } from '@/utils/serverAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div>
      <nav className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <Link href="/admin" className="btn btn-ghost text-xl">
            FBA Admin
          </Link>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link href="/admin">Tableau de bord</Link>
            </li>
            <li>
              <Link href="/admin/users">Utilisateurs</Link>
            </li>
          </ul>
          <span className="text-base-content/70 ml-2 text-sm">
            {session.user.name}
          </span>
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
