import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const publicPaths = ['/', '/login'];
  const { pathname } = req.nextUrl;

  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie (default: next-auth.session-token)
  const sessionCookie =
    req.cookies.get('next-auth.session-token') ||
    req.cookies.get('__Secure-next-auth.session-token');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

// Only run middleware on these paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
