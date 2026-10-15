import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
export const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'wedding-memories';
export const publicR2Url = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

// If credentials exist, initialize S3 Client for Cloudflare R2
const isR2Configured = !!(accountId && accessKeyId && secretAccessKey);

export const s3Client = isR2Configured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  : null;

/**
 * Uploads a file buffer either to Cloudflare R2 or to local public storage
 */
export async function uploadMediaFile(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  eventId: number
): Promise<{ key: string; url: string; disk: 'r2' | 'local' }> {
  const objectKey = `events/${eventId}/photos/${filename}`;

  if (s3Client) {
    // 1. Upload to Cloudflare R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    const fileUrl = publicR2Url ? `${publicR2Url}/${objectKey}` : `/api/media/${objectKey}`;
    return { key: objectKey, url: fileUrl, disk: 'r2' };
  } else {
    // 2. Local fallback storage in public/uploads for local dev
    const localDir = path.join(process.cwd(), 'public', 'uploads', `events_${eventId}`);
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const localFilePath = path.join(localDir, filename);
    fs.writeFileSync(localFilePath, buffer);

    const fileUrl = `/uploads/events_${eventId}/${filename}`;
    return { key: objectKey, url: fileUrl, disk: 'local' };
  }
}

/**
 * Deletes a file either from Cloudflare R2 or local storage
 */
export async function deleteMediaFile(key: string, disk: 'r2' | 'local', eventId: number) {
  if (disk === 'r2' && s3Client) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } else {
    const filename = path.basename(key);
    const localFilePath = path.join(process.cwd(), 'public', 'uploads', `events_${eventId}`, filename);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}
