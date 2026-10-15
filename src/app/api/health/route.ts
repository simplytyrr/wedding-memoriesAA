import { NextResponse } from 'next/server';
import { initDbAndSeed } from '@/db/seed';
import { db } from '@/db';
import { users, weddingEvents, mediaUploads } from '@/db/schema';
import { bucketName, s3Client } from '@/lib/storage';

export async function GET() {
  try {
    await initDbAndSeed();

    const allUsers = db.select().from(users).all();
    const allEvents = db.select().from(weddingEvents).all();
    const allMedia = db.select().from(mediaUploads).all();

    return NextResponse.json({
      status: 'ok',
      platform: 'EverAfter Memories (Next.js Serverless)',
      runtime: 'Next.js App Router + Cloudflare D1/R2 ready',
      storage: {
        driver: s3Client ? 'Cloudflare R2 (S3-Compatible)' : 'Local File Storage (Fallback for Dev)',
        bucket: bucketName,
        r2_configured: !!s3Client,
      },
      database: {
        driver: 'D1 / SQLite (Drizzle ORM)',
        users_count: allUsers.length,
        events_count: allEvents.length,
        media_count: allMedia.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
