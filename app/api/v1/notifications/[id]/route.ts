import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { markAsRead } from '@/lib/notifications';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  const { id } = await params;
  const updated = await markAsRead(id, session.user.id);

  if (!updated) {
    return NextResponse.json(
      { error: 'Notification introuvable.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: updated });
}
