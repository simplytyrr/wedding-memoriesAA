import { db } from './index';
import { users, weddingEvents, eventSessions, eventThemes } from './schema';
import { hashPassword } from '../lib/auth';
import { sql } from 'drizzle-orm';

export async function initDbAndSeed() {
  // Create tables using SQLite raw statement if not exists
  const createStatements = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      avatar TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'owner' NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS wedding_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      couple_names TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_image TEXT,
      welcome_message TEXT,
      event_date TEXT NOT NULL,
      venue TEXT,
      status TEXT DEFAULT 'published' NOT NULL,
      gallery_visibility TEXT DEFAULT 'public' NOT NULL,
      gallery_pin TEXT,
      moderation_enabled INTEGER DEFAULT 1 NOT NULL,
      guest_upload_enabled INTEGER DEFAULT 1 NOT NULL,
      theme_key TEXT DEFAULT 'dusty-rose' NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS event_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wedding_event_id INTEGER NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      session_type TEXT DEFAULT 'akad_nikah' NOT NULL,
      session_slug TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      venue TEXT,
      description TEXT,
      upload_enabled INTEGER DEFAULT 1 NOT NULL,
      moderation_enabled INTEGER DEFAULT 1 NOT NULL,
      camera_shot_limit INTEGER DEFAULT 15 NOT NULL,
      order_index INTEGER DEFAULT 0 NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS event_themes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      theme_key TEXT NOT NULL UNIQUE,
      primary_color TEXT NOT NULL,
      secondary_color TEXT NOT NULL,
      accent_color TEXT NOT NULL,
      background_color TEXT NOT NULL,
      font_family TEXT DEFAULT 'serif' NOT NULL,
      is_preset INTEGER DEFAULT 1 NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS qr_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wedding_event_id INTEGER NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
      event_session_id INTEGER REFERENCES event_sessions(id) ON DELETE CASCADE,
      code_type TEXT DEFAULT 'main_event' NOT NULL,
      target_url TEXT NOT NULL,
      raw_token TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      scan_count INTEGER DEFAULT 0 NOT NULL,
      active INTEGER DEFAULT 1 NOT NULL,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS media_uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wedding_event_id INTEGER NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
      event_session_id INTEGER REFERENCES event_sessions(id) ON DELETE SET NULL,
      guest_session_id TEXT,
      guest_name TEXT DEFAULT 'Tetamu',
      file_path TEXT NOT NULL,
      storage_disk TEXT DEFAULT 'local' NOT NULL,
      original_filename TEXT NOT NULL,
      file_type TEXT DEFAULT 'photo' NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      filter_applied TEXT DEFAULT 'original' NOT NULL,
      moderation_status TEXT DEFAULT 'pending' NOT NULL,
      ip_hash TEXT,
      consent_at TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS guest_wishes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wedding_event_id INTEGER NOT NULL REFERENCES wedding_events(id) ON DELETE CASCADE,
      event_session_id INTEGER REFERENCES event_sessions(id) ON DELETE SET NULL,
      guest_name TEXT DEFAULT 'Tetamu',
      message TEXT NOT NULL,
      moderation_status TEXT DEFAULT 'pending' NOT NULL,
      ip_hash TEXT,
      consent_at TEXT,
      created_at TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      wedding_event_id INTEGER,
      action TEXT NOT NULL,
      meta_json TEXT,
      created_at TEXT NOT NULL
    );`
  ];

  for (const stmt of createStatements) {
    db.run(sql.raw(stmt));
  }

  // Seed demo owner and admin users if none exist
  const existingUsers = db.select().from(users).all();
  if (existingUsers.length === 0) {
    const ownerPass = await hashPassword('password123');
    const adminPass = await hashPassword('admin123');

    db.insert(users).values([
      {
        name: 'Farhan & Aina (Pengantin)',
        email: 'owner@example.com',
        password: ownerPass,
        role: 'owner',
      },
      {
        name: 'Super Administrator',
        email: 'admin@example.com',
        password: adminPass,
        role: 'superadmin',
      },
    ]).run();

    // Seed Demo Wedding Event
    db.insert(weddingEvents).values({
      userId: 1,
      title: 'Walimatulurus Adam & Hawa',
      coupleNames: 'Adam & Hawa',
      slug: 'adam-hawa',
      eventDate: '2026-11-20',
      venue: 'Dewan Perdana Felda, Kuala Lumpur',
      welcomeMessage: 'Selamat datang ke majlis kami! Kongsikan memori indah anda.',
      status: 'published',
      moderationEnabled: true,
      guestUploadEnabled: true,
      themeKey: 'dusty-rose',
    }).run();

    // Seed Sessions
    db.insert(eventSessions).values([
      {
        weddingEventId: 1,
        title: 'Upacara Akad Nikah',
        sessionType: 'akad_nikah',
        sessionSlug: 'akad-nikah',
        date: '2026-11-20',
        startTime: '10:00',
        endTime: '12:00',
        venue: 'Masjid Wilayah Persekutuan, KL',
        cameraShotLimit: 10,
        orderIndex: 1,
      },
      {
        weddingEventId: 1,
        title: 'Majlis Bersanding & Jamuan',
        sessionType: 'sanding',
        sessionSlug: 'majlis-sanding',
        date: '2026-11-20',
        startTime: '12:30',
        endTime: '16:00',
        venue: 'Dewan Perdana Felda, KL',
        cameraShotLimit: 20,
        orderIndex: 2,
      },
    ]).run();
  }
}
