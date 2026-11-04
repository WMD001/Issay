import { NextResponse } from 'next/server';

export function proxy() {
  const response = NextResponse.next();
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  );
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)'],
};