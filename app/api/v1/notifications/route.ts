import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { getUserNotifications, getUnreadCount } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 1),
    100,
  );
  const offset = Math.max(
    parseInt(searchParams.get('offset') ?? '0', 10) || 0,
    0,
  );

  const { data, count } = await getUserNotifications(session.user.id, {
    limit,
    offset,
  });
  const unreadCount = await getUnreadCount(session.user.id);

  return NextResponse.json({ data, count, unreadCount });
}
