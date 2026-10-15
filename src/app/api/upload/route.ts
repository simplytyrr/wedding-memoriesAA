import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { mediaUploads, weddingEvents, guestWishes } from '@/db/schema';
import { uploadMediaFile } from '@/lib/storage';
import { eq } from 'drizzle-orm';
import { initDbAndSeed } from '@/db/seed';

export async function POST(req: NextRequest) {
  try {
    await initDbAndSeed();
    const formData = await req.formData();

    const slug = formData.get('slug') as string;
    const file = formData.get('photo') as File | null;
    const guestName = (formData.get('guest_name') as string) || 'Tetamu';
    const message = (formData.get('message') as string) || '';
    const sessionId = formData.get('session_id') ? parseInt(formData.get('session_id') as string, 10) : null;
    const filterApplied = (formData.get('filter_applied') as string) || 'original';

    if (!slug) {
      return NextResponse.json({ message: 'Slug majlis diperlukan.' }, { status: 400 });
    }

    const event = db.select().from(weddingEvents).where(eq(weddingEvents.slug, slug)).get();
    if (!event) {
      return NextResponse.json({ message: 'Majlis tidak dijumpai.' }, { status: 404 });
    }

    let uploadedMedia = null;

    // Process photo upload to Cloudflare R2 / Local fallback
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

      const { key, url, disk } = await uploadMediaFile(buffer, filename, file.type, event.id);

      const status = event.moderationEnabled ? 'pending' : 'approved';

      const insertRes = db.insert(mediaUploads).values({
        weddingEventId: event.id,
        eventSessionId: sessionId,
        guestName,
        filePath: url,
        storageDisk: disk,
        originalFilename: file.name,
        fileType: 'photo',
        mimeType: file.type || 'image/jpeg',
        fileSize: file.size,
        filterApplied,
        moderationStatus: status,
        consentAt: new Date().toISOString(),
      }).returning().get();

      uploadedMedia = insertRes;
    }

    // Process wishes
    if (message.trim()) {
      db.insert(guestWishes).values({
        weddingEventId: event.id,
        eventSessionId: sessionId,
        guestName,
        message,
        moderationStatus: event.moderationEnabled ? 'pending' : 'approved',
        consentAt: new Date().toISOString(),
      }).run();
    }

    const isPending = event.moderationEnabled;

    return NextResponse.json({
      message: isPending
        ? 'Terima kasih! Foto & ucapan anda telah diterima dan sedang menunggu pengesahan pengantin.'
        : 'Terima kasih! Foto & ucapan anda telah berjaya dimuat naik ke galeri!',
      status: isPending ? 'pending' : 'approved',
      media: uploadedMedia,
    });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ message: error.message || 'Gagal memuat naik fail.' }, { status: 500 });
  }
}
