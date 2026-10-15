import { NextRequest, NextResponse } from 'next/server';
import { s3Client, bucketName } from '@/lib/storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathParts = resolvedParams.path || [];
    const objectKey = pathParts.join('/');

    // 1. Try serving from Cloudflare R2 if configured
    if (s3Client) {
      try {
        const response = await s3Client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: objectKey,
          })
        );

        if (response.Body) {
          const stream = response.Body as any;
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);

          return new NextResponse(buffer, {
            headers: {
              'Content-Type': response.ContentType || 'image/jpeg',
              'Cache-Control': 'public, max-age=31536000, immutable',
            },
          });
        }
      } catch (err: any) {
        console.warn('R2 proxy read failed, trying local fallback:', err.message);
      }
    }

    // 2. Fallback to local uploads directory
    const filename = path.basename(objectKey);
    // Find file in public/uploads subdirectories
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let localFile: string | null = null;

    if (fs.existsSync(uploadsDir)) {
      const subdirs = fs.readdirSync(uploadsDir);
      for (const dir of subdirs) {
        const potentialPath = path.join(uploadsDir, dir, filename);
        if (fs.existsSync(potentialPath)) {
          localFile = potentialPath;
          break;
        }
      }
    }

    if (localFile && fs.existsSync(localFile)) {
      const buffer = fs.readFileSync(localFile);
      const ext = path.extname(localFile).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mime,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new NextResponse('File not found', { status: 404 });
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
