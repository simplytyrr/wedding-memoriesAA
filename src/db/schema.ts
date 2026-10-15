import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  avatar: text('avatar'),
  password: text('password').notNull(),
  role: text('role', { enum: ['superadmin', 'owner', 'guest'] }).default('owner').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const weddingEvents = sqliteTable('wedding_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  coupleNames: text('couple_names').notNull(),
  slug: text('slug').notNull().unique(),
  coverImage: text('cover_image'),
  welcomeMessage: text('welcome_message'),
  eventDate: text('event_date').notNull(),
  venue: text('venue'),
  status: text('status', { enum: ['draft', 'published', 'archived'] }).default('published').notNull(),
  galleryVisibility: text('gallery_visibility', { enum: ['public', 'private', 'pin_protected'] }).default('public').notNull(),
  galleryPin: text('gallery_pin'),
  moderationEnabled: integer('moderation_enabled', { mode: 'boolean' }).default(true).notNull(),
  guestUploadEnabled: integer('guest_upload_enabled', { mode: 'boolean' }).default(true).notNull(),
  themeKey: text('theme_key').default('dusty-rose').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const eventSessions = sqliteTable('event_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weddingEventId: integer('wedding_event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  sessionType: text('session_type', { enum: ['akad_nikah', 'sanding', 'berinai', 'reception', 'custom'] }).default('akad_nikah').notNull(),
  sessionSlug: text('session_slug').notNull(),
  date: text('date').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  venue: text('venue'),
  description: text('description'),
  uploadEnabled: integer('upload_enabled', { mode: 'boolean' }).default(true).notNull(),
  moderationEnabled: integer('moderation_enabled', { mode: 'boolean' }).default(true).notNull(),
  cameraShotLimit: integer('camera_shot_limit').default(15).notNull(),
  orderIndex: integer('order_index').default(0).notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const eventThemes = sqliteTable('event_themes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  themeKey: text('theme_key').notNull().unique(),
  primaryColor: text('primary_color').notNull(),
  secondaryColor: text('secondary_color').notNull(),
  accentColor: text('accent_color').notNull(),
  backgroundColor: text('background_color').notNull(),
  fontFamily: text('font_family').default('serif').notNull(),
  isPreset: integer('is_preset', { mode: 'boolean' }).default(true).notNull(),
});

export const qrCodes = sqliteTable('qr_codes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weddingEventId: integer('wedding_event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }).notNull(),
  eventSessionId: integer('event_session_id').references(() => eventSessions.id, { onDelete: 'cascade' }),
  codeType: text('code_type', { enum: ['main_event', 'session'] }).default('main_event').notNull(),
  targetUrl: text('target_url').notNull(),
  rawToken: text('raw_token').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  scanCount: integer('scan_count').default(0).notNull(),
  active: integer('active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const mediaUploads = sqliteTable('media_uploads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weddingEventId: integer('wedding_event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }).notNull(),
  eventSessionId: integer('event_session_id').references(() => eventSessions.id, { onDelete: 'set null' }),
  guestSessionId: text('guest_session_id'),
  guestName: text('guest_name').default('Tetamu'),
  filePath: text('file_path').notNull(),
  storageDisk: text('storage_disk', { enum: ['r2', 'local'] }).default('local').notNull(),
  originalFilename: text('original_filename').notNull(),
  fileType: text('file_type', { enum: ['photo', 'video'] }).default('photo').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  filterApplied: text('filter_applied').default('original').notNull(),
  moderationStatus: text('moderation_status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  ipHash: text('ip_hash'),
  consentAt: text('consent_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const guestWishes = sqliteTable('guest_wishes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weddingEventId: integer('wedding_event_id').references(() => weddingEvents.id, { onDelete: 'cascade' }).notNull(),
  eventSessionId: integer('event_session_id').references(() => eventSessions.id, { onDelete: 'set null' }),
  guestName: text('guest_name').default('Tetamu'),
  message: text('message').notNull(),
  moderationStatus: text('moderation_status', { enum: ['pending', 'approved', 'rejected'] }).default('pending').notNull(),
  ipHash: text('ip_hash'),
  consentAt: text('consent_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id'),
  weddingEventId: integer('wedding_event_id'),
  action: text('action').notNull(),
  metaJson: text('meta_json'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
});
