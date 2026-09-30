import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firebaseAdmin';
import { verifySessionValue, SESSION_COOKIE_NAME } from '../../../lib/auth';
import { DEFAULT_CONTENT, LIMITS, sanitizeContent } from '../../../lib/siteContent';

export const dynamic = 'force-dynamic';

const COLLECTION = 'config';
const DOC_ID = 'siteContent';

// Public read. If the document doesn't exist yet (or Firebase isn't
// reachable) the site simply falls back to the built-in default text.
export async function GET() {
  try {
    const snap = await getDb().collection(COLLECTION).doc(DOC_ID).get();
    if (!snap.exists) return NextResponse.json(DEFAULT_CONTENT);
    return NextResponse.json(sanitizeContent(snap.data()));
  } catch (err) {
    return NextResponse.json(DEFAULT_CONTENT);
  }
}

export async function PUT(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie ? await verifySessionValue(cookie.value) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const steps = Array.isArray(body.process && body.process.steps) ? body.process.steps : [];
  const filled = steps.filter((s) => s && typeof s.title === 'string' && s.title.trim());
  if (filled.length < LIMITS.minSteps) {
    return NextResponse.json(
      { error: `Add at least ${LIMITS.minSteps} steps (each step needs a title).` },
      { status: 400 }
    );
  }

  const clean = sanitizeContent(body);

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    await db.collection(COLLECTION).doc(DOC_ID).set({
      ...clean,
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, content: clean });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
