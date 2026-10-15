import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Pada serverless macam Vercel (Linux /var/task adalah read-only),
// kita gunakan folder writable /tmp jika bukan di local Windows.
const isVercelOrLinuxServerless = process.env.VERCEL || process.platform === 'linux';
const dbDir = isVercelOrLinuxServerless ? path.join(os.tmpdir(), 'everafter_data') : path.join(process.cwd(), 'data');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(path.join(dbDir, 'everafter.sqlite'));
export const db = drizzle(sqlite, { schema });

