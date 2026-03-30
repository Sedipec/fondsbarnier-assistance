import { NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { markAllAsRead } from '@/lib/notifications';

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  await markAllAsRead(session.user.id);

  return NextResponse.json({ data: { success: true } });
}
