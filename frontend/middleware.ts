// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// parse exp tanpa verify – cukup utk cek kadaluarsa
function isExpired(jwt?: string): boolean {
  if (!jwt) return true;
  const parts = jwt.split('.');
  if (parts.length !== 3) return true;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
    if (!payload?.exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowSec;
  } catch {
    return true;
  }
}

// halaman publik yang selalu boleh diakses
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register'];

// halaman privat (wajib token valid)
const PRIVATE_PREFIXES = ['/initial', '/profile', '/messages', '/chat', '/settings'];

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allow static / assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('jwt')?.value;
  const expired = isExpired(token);

  const needsAuth = PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
  if (needsAuth && expired) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // sudah login, tapi masuk /auth/* -> lempar ke /initial
  if (!expired && pathname.startsWith('/auth/')) {
    const url = req.nextUrl.clone();
    url.pathname = '/initial';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // selain itu lanjut
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
