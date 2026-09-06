import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firebaseAdmin';
import { verifySessionValue, SESSION_COOKIE_NAME } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

const COLLECTION = 'config';
const DOC_ID = 'portfolio';

export async function GET() {
  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    const snap = await db.collection(COLLECTION).doc(DOC_ID).get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: 'No portfolio document found. Run: node --env-file=.env.local scripts/seed-portfolio-firebase.js' },
        { status: 404 }
      );
    }
    return NextResponse.json(snap.data().items);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie ? await verifySessionValue(cookie.value) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    await db.collection(COLLECTION).doc(DOC_ID).set({
      items: body,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
