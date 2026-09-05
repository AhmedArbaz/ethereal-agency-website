import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Server-only Firestore client using a service account -- this has full
// admin access and must NEVER be exposed to the browser. It's only ever
// imported inside app/api/* route handlers, which run on the server.
//
// The client is created lazily (on first use) rather than at module load
// time, so `next build` still succeeds even before .env.local is filled in.

let db = null;

export function getDb() {
  if (db) return db;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local (see .env.local.example).'
    );
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        // .env files can't hold real newlines, so the key is stored with
        // literal "\n" sequences and unescaped here.
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  db = getFirestore();
  return db;
}
