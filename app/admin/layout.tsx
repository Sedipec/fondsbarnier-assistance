import { auth } from '@/utils/serverAuth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Breadcrumb from '@/components/shared/Breadcrumb';
import BottomNav from '@/components/shared/BottomNav';

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
    redirect('/espace/mon-dossier');
  }

  // TODO: remplacer par une requete DB quand la table dossiers existera
  // ex: const dossierCount = await db.select({ count: count() }).from(dossiers);
  const dossierCount = undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar dossierCount={dossierCount} />
      <main className="bg-base-200 flex-1 p-4 pb-20 pt-16 md:p-6 lg:p-8 lg:pb-8 lg:pt-8">
        <Breadcrumb />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
