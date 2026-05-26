import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIVATE_PATHS = ['/ControlPanel'];
const AUTH_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('better-auth.session_token');

  const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isPrivate && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuth && sessionToken) {
    return NextResponse.redirect(new URL('/ControlPanel', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/ControlPanel/:path*', '/login'],
};
