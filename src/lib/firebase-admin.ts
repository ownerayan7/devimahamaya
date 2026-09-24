import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let firebaseApp: App | undefined;

try {
  const configPath = path.resolve(__dirname, '../../firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawData = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawData);
    if (!getApps().length && firebaseConfig?.projectId) {
      firebaseApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    }
  }
} catch (error) {
  console.warn('Firebase Admin initialization skipped or failed:', error);
}

export const adminAuth = (getApps().length ? getAuth() : null) as Auth;

