import { auth } from '@/utils/serverAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { SignOutButton } from '@/components/auth/SignOutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div>
      <nav className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <Link href="/dashboard" className="btn btn-ghost text-xl">
            FondsBarnierAssistance
          </Link>
        </div>
        <div className="flex-none gap-2">
          <span className="text-base-content/70 text-sm">
            {session.user.name}
          </span>
          <SignOutButton />
        </div>
      </nav>
      {children}
    </div>
  );
}
