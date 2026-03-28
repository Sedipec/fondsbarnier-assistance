import { NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { db } from '@/db';
import { sources } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorise.' }, { status: 401 });
  }

  const data = await db
    .select({
      id: sources.id,
      slug: sources.slug,
      label: sources.label,
    })
    .from(sources)
    .orderBy(asc(sources.label));

  return NextResponse.json({ data });
}
