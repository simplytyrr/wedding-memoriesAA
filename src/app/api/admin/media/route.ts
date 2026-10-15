import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaUploads, weddingEvents } from '@/db/schema';
import { deleteMediaFile } from '@/lib/storage';
import { verifyToken } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Hanya Super Admin dibenarkan.' }, { status: 403 });
    }

    const allMedia = db
      .select({
        id: mediaUploads.id,
        weddingEventId: mediaUploads.weddingEventId,
        guestName: mediaUploads.guestName,
        filePath: mediaUploads.filePath,
        storageDisk: mediaUploads.storageDisk,
        moderationStatus: mediaUploads.moderationStatus,
        createdAt: mediaUploads.createdAt,
        eventTitle: weddingEvents.title,
      })
      .from(mediaUploads)
      .leftJoin(weddingEvents, eq(mediaUploads.weddingEventId, weddingEvents.id))
      .orderBy(desc(mediaUploads.id))
      .all();

    return NextResponse.json({ media: allMedia });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const user = token ? await verifyToken(token) : null;

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ message: 'Hanya Super Admin dibenarkan.' }, { status: 403 });
    }

    const { id } = await req.json();
    const media = db.select().from(mediaUploads).where(eq(mediaUploads.id, id)).get();

    if (!media) {
      return NextResponse.json({ message: 'Gambar tidak dijumpai.' }, { status: 404 });
    }

    // Delete file from R2 / local
    await deleteMediaFile(media.filePath, media.storageDisk as any, media.weddingEventId);

    // Delete record from DB
    db.delete(mediaUploads).where(eq(mediaUploads.id, id)).run();

    return NextResponse.json({ message: 'Gambar berjaya dipadamkan oleh Super Admin.' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
