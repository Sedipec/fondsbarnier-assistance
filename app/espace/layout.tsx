import { auth } from '@/utils/serverAuth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import Breadcrumb from '@/components/shared/Breadcrumb';

export default async function EspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  if (session.user.role === 'admin') {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="bg-base-200 flex-1 p-6 lg:p-8">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
}
