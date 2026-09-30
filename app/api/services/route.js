import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firebaseAdmin';
import { verifySessionValue, SESSION_COOKIE_NAME } from '../../../lib/auth';
import { cleanTags } from '../../../lib/serviceTags';

export const dynamic = 'force-dynamic';

const COLLECTION = 'config';
const DOC_ID = 'services';

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
        { error: 'No services document found. Run: node --env-file=.env.local scripts/seed-services-firebase.js' },
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

  // Normalise tags server-side so the site never renders junk chips.
  const items = body.map((item) => ({ ...item, tags: cleanTags(item.tags) }));

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    await db.collection(COLLECTION).doc(DOC_ID).set({
      items,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
