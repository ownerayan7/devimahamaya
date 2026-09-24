import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

// Define the 'users' table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoURL: text('photo_url'),
  role: text('role').default('member'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Club activity records / events
export const clubRecords = pgTable('club_records', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tree plantation log entries
export const treePlantationRecords = pgTable('tree_plantation_records', {
  id: serial('id').primaryKey(),
  species: text('species').notNull(),
  location: text('location').notNull(),
  plantedBy: text('planted_by').notNull(),
  date: text('date').notNull(),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Workspace connected items (links to Google Workspace items like Drive files, Chat spaces, Calendar events, Tasks, Forms)
export const workspaceItems = pgTable('workspace_items', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  service: text('service').notNull(), // 'chat', 'drive', 'calendar', 'tasks', 'forms', 'gmail'
  externalId: text('external_id').notNull(),
  title: text('title').notNull(),
  data: jsonb('data'),
  syncedAt: timestamp('synced_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  records: many(clubRecords),
}));

export const clubRecordsRelations = relations(clubRecords, ({ one }) => ({
  user: one(users, {
    fields: [clubRecords.userId],
    references: [users.id],
  }),
}));
