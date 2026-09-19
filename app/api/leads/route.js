import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/firebaseAdmin';
import { verifySessionValue, SESSION_COOKIE_NAME } from '../../../lib/auth';
import { sendLeadNotification } from '../../../lib/email';

export const dynamic = 'force-dynamic';

const COLLECTION = 'leads';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/leads — public, called from the contact form on the homepage.
export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const service = String(body.service || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Please provide a valid name and email address.' },
      { status: 400 }
    );
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const lead = {
    name,
    email,
    service: service || 'Not specified',
    message,
    status: 'new',
    createdAt: new Date().toISOString(),
  };

  let docRef;
  try {
    docRef = await db.collection(COLLECTION).add(lead);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  // Best-effort — never let an email failure fail the form submission.
  sendLeadNotification(lead).catch(() => {});

  return NextResponse.json({ ok: true, id: docRef.id });
}

// GET /api/leads — admin-only, lists leads newest first.
export async function GET(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie ? await verifySessionValue(cookie.value) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    const leads = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(leads);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/leads — admin-only, updates a lead's status (e.g. new -> contacted).
export async function PATCH(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie ? await verifySessionValue(cookie.value) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.id || !body.status) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    await db.collection(COLLECTION).doc(body.id).update({ status: body.status });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/leads?id=... — admin-only.
export async function DELETE(request) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = cookie ? await verifySessionValue(cookie.value) : null;
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  let db;
  try {
    db = getDb();
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  try {
    await db.collection(COLLECTION).doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
