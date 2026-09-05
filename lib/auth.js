// Simple email+password auth with a signed, expiring session cookie.
// Uses the Web Crypto API (globalThis.crypto.subtle) instead of Node's
// "crypto" module so the exact same code runs in both the Edge middleware
// and the Node.js API routes.
//
// The payload is base64url-encoded before signing so the cookie value only
// ever contains [A-Za-z0-9-_.] -- characters like "@" in an email address
// would otherwise get percent-encoded somewhere between the browser and the
// server, changing the string after it was signed and breaking verification.

const SECRET = process.env.SESSION_SECRET || 'ethereal-dev-secret-change-me';
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ah2797764@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeThisPassword123';

export const SESSION_COOKIE_NAME = 'ethereal_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function bufToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function toBase64Url(str) {
  const b64 = btoa(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return atob(b64);
}

async function hmac(value) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return bufToHex(sigBuffer);
}

export function checkCredentials(email, password) {
  return (
    !!email &&
    !!password &&
    String(email).toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export async function createSessionValue(email) {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${email}|${expires}`;
  const encodedPayload = toBase64Url(payload);
  const signature = await hmac(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionValue(value) {
  if (!value) return null;
  const dotIdx = value.lastIndexOf('.');
  if (dotIdx === -1) return null;

  const encodedPayload = value.slice(0, dotIdx);
  const signature = value.slice(dotIdx + 1);

  const expected = await hmac(encodedPayload);
  if (expected !== signature) return null;

  let payload;
  try {
    payload = fromBase64Url(encodedPayload);
  } catch {
    return null;
  }

  const sepIdx = payload.lastIndexOf('|');
  if (sepIdx === -1) return null;
  const email = payload.slice(0, sepIdx);
  const expires = payload.slice(sepIdx + 1);

  if (Date.now() > Number(expires)) return null;
  return { email };
}
