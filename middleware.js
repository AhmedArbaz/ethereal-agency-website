import { NextResponse } from 'next/server';
import { verifySessionValue, SESSION_COOKIE_NAME } from './lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const cookie = request.cookies.get(SESSION_COOKIE_NAME);
    const session = cookie ? await verifySessionValue(cookie.value) : null;
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
