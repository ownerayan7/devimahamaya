import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || '127.0.0.1',
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || 'postgres',
      database: process.env.SQL_DB_NAME || 'postgres',
      max: 10,
      connectionTimeoutMillis: 10000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });

    // Auto-create essential tables if they do not exist in Cloud SQL
    initializeTables(global._postgresPool).catch((err) => {
      console.warn('[PostgreSQL Init] Table auto-creation notice:', err?.message || err);
    });
  }
  return global._postgresPool;
};

async function initializeTables(pool: Pool) {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          display_name TEXT,
          photo_url TEXT,
          role TEXT DEFAULT 'member',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS club_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tree_plantation_records (
          id SERIAL PRIMARY KEY,
          species TEXT NOT NULL,
          location TEXT NOT NULL,
          planted_by TEXT NOT NULL,
          date TEXT NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS workspace_items (
          id SERIAL PRIMARY KEY,
          user_uid TEXT NOT NULL,
          service TEXT NOT NULL,
          external_id TEXT NOT NULL,
          title TEXT NOT NULL,
          data JSONB,
          synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sync_logs (
          id SERIAL PRIMARY KEY,
          source TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          title TEXT NOT NULL,
          content TEXT,
          firestore_doc_id TEXT,
          cloud_sql_id INTEGER,
          uploaded_by TEXT,
          device_info TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS media_cloud_files (
          id SERIAL PRIMARY KEY,
          filename TEXT NOT NULL UNIQUE,
          mime_type TEXT NOT NULL,
          public_url TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          size_bytes INTEGER,
          uploaded_by TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('[PostgreSQL Init] All database tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('[PostgreSQL Init] Schema initialization bypassed:', err);
  }
}

const pool = createPool();

export const db = drizzle(pool, { schema });
