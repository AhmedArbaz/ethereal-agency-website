// One-time seed: pushes data/services.json into the Firestore
// config/services document.
//
// Usage (Node 20.6+, which supports --env-file natively):
//   node --env-file=.env.local scripts/seed-services-firebase.js

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    'Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY.\n' +
    'Run with: node --env-file=.env.local scripts/seed-services-firebase.js'
  );
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  }),
});

const dataPath = path.join(__dirname, '..', 'data', 'services.json');
const services = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function main() {
  const db = getFirestore();
  await db.collection('config').doc('services').set({
    items: services,
    updatedAt: new Date().toISOString(),
  });
  console.log('Seeded config/services with', services.length, 'cards.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
