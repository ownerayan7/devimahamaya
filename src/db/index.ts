import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const isSqlConfigured = Boolean(process.env.SQL_HOST || process.env.DATABASE_URL);

    global._postgresPool = new Pool({
      host: process.env.SQL_HOST || '127.0.0.1',
      user: process.env.SQL_USER || 'postgres',
      password: process.env.SQL_PASSWORD || 'postgres',
      database: process.env.SQL_DB_NAME || 'postgres',
      max: 10,
      connectionTimeoutMillis: 3000,
    });

    global._postgresPool.on('error', (err) => {
      console.warn('[PostgreSQL Pool Notice]:', err?.message || err);
    });

    // Auto-create essential tables if PostgreSQL is configured
    if (isSqlConfigured) {
      initializeTables(global._postgresPool).catch((err) => {
        console.warn('[PostgreSQL Init Notice]:', err?.message || err);
      });
    } else {
      console.log('[PostgreSQL] Using Firebase Firestore as primary real-time database.');
    }
  }
  return global._postgresPool;
};

async function initializeTables(pool: Pool) {
  const tables = [
    { name: 'users', query: `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          uid TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL,
          display_name TEXT,
          photo_url TEXT,
          role TEXT DEFAULT 'member',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );` 
    },
    { name: 'club_records', query: `
        CREATE TABLE IF NOT EXISTS club_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          description TEXT,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );` 
    },
    { name: 'tree_plantation_records', query: `
        CREATE TABLE IF NOT EXISTS tree_plantation_records (
          id SERIAL PRIMARY KEY,
          species TEXT NOT NULL,
          location TEXT NOT NULL,
          planted_by TEXT NOT NULL,
          date TEXT NOT NULL,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );` 
    },
    { name: 'workspace_items', query: `
        CREATE TABLE IF NOT EXISTS workspace_items (
          id SERIAL PRIMARY KEY,
          user_uid TEXT NOT NULL,
          service TEXT NOT NULL,
          external_id TEXT NOT NULL,
          title TEXT NOT NULL,
          data JSONB,
          synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );` 
    },
    { name: 'sync_logs', query: `
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
        );` 
    },
    { name: 'media_cloud_files', query: `
        CREATE TABLE IF NOT EXISTS media_cloud_files (
          id SERIAL PRIMARY KEY,
          filename TEXT NOT NULL UNIQUE,
          mime_type TEXT NOT NULL,
          public_url TEXT NOT NULL,
          category TEXT DEFAULT 'general',
          size_bytes INTEGER,
          uploaded_by TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );` 
    }
  ];

  for (const table of tables) {
    try {
      await pool.query(table.query);
      console.log(`[PostgreSQL Init] Table '${table.name}' checked successfully.`);
    } catch (err: any) {
      if (err?.code === '42501' || err?.message?.includes('permission denied')) {
        console.log(`[PostgreSQL Init] Schema permission restricted; defaulting to Firebase Firestore.`);
        break; // Stop loop cleanly
      }
      console.warn(`[PostgreSQL Init] Table notice ('${table.name}'):`, err?.message || err);
    }
  }
}

const pool = createPool();

export const db = drizzle(pool, { schema });
