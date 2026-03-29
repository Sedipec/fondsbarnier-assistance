import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/serverAuth';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/data/uploads';

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifie.' }, { status: 401 });
  }

  const { path: segments } = await params;
  const filePath = segments.join('/');

  // Securite : empecher le path traversal
  const resolved = path.resolve(UPLOAD_DIR, filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return NextResponse.json({ error: 'Chemin invalide.' }, { status: 400 });
  }

  try {
    const buffer = await readFile(resolved);
    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.basename(resolved)}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Fichier introuvable.' },
      { status: 404 },
    );
  }
}
