import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaUploads } from '@/db/schema';
import { verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = token ? await verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ message: 'Sila log masuk.' }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ message: 'Status tidak sah.' }, { status: 400 });
    }

    db.update(mediaUploads)
      .set({ moderationStatus: status })
      .where(eq(mediaUploads.id, id))
      .run();

    return NextResponse.json({ message: `Gambar berjaya diubah ke status: ${status}` });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
