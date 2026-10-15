import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weddingEvents } from '@/db/schema';
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

    const { eventId, moderationEnabled } = await req.json();

    db.update(weddingEvents)
      .set({ moderationEnabled: !!moderationEnabled })
      .where(eq(weddingEvents.id, eventId))
      .run();

    return NextResponse.json({
      message: moderationEnabled
        ? 'Moderasi diaktifkan. Foto perlu kelulusan admin/pengantin.'
        : 'Moderasi dimatikan! Foto tetamu akan terus masuk secara langsung ke galeri.',
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
