import { NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Acces refuse.' }, { status: 403 });
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ data: allUsers, count: allUsers.length });
}
