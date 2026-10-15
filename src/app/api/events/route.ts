import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { weddingEvents, eventSessions, mediaUploads, guestWishes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { initDbAndSeed } from '@/db/seed';

export async function GET(req: NextRequest) {
  try {
    await initDbAndSeed();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      // List events
      const events = db.select().from(weddingEvents).all();
      return NextResponse.json({ events });
    }

    // Single event with sessions and approved gallery
    const event = db.select().from(weddingEvents).where(eq(weddingEvents.slug, slug)).get();

    if (!event) {
      return NextResponse.json({ message: 'Majlis tidak dijumpai.' }, { status: 404 });
    }

    const sessions = db
      .select()
      .from(eventSessions)
      .where(eq(eventSessions.weddingEventId, event.id))
      .all();

    const photos = db
      .select()
      .from(mediaUploads)
      .where(eq(mediaUploads.weddingEventId, event.id))
      .orderBy(desc(mediaUploads.id))
      .all();

    const wishes = db
      .select()
      .from(guestWishes)
      .where(eq(guestWishes.weddingEventId, event.id))
      .orderBy(desc(guestWishes.id))
      .all();

    return NextResponse.json({
      event,
      sessions,
      photos: photos.filter((p) => p.moderationStatus === 'approved'),
      wishes: wishes.filter((w) => w.moderationStatus === 'approved'),
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
