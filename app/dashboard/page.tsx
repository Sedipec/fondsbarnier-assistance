import { auth } from '@/utils/serverAuth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();
  const role = session?.user?.role;
  redirect(role === 'admin' ? '/admin/dashboard' : '/espace/mon-dossier');
}
