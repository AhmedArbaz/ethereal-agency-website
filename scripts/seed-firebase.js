// One-time seed: pushes data/pricing.json into the Firestore
// config/pricing document. Run this once after setting up your Firebase
// service account credentials.
//
// Usage (Node 20.6+, which supports --env-file natively):
//   node --env-file=.env.local scripts/seed-firebase.js
//
// If your Node version doesn't support --env-file, export the three
// FIREBASE_* variables in your shell first instead, then:
//   node scripts/seed-firebase.js

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
    'Run with: node --env-file=.env.local scripts/seed-firebase.js'
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

const dataPath = path.join(__dirname, '..', 'data', 'pricing.json');
const pricing = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function main() {
  const db = getFirestore();
  await db.collection('config').doc('pricing').set({
    categories: pricing,
    updatedAt: new Date().toISOString(),
  });
  console.log('Seeded config/pricing with', pricing.length, 'categories.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
