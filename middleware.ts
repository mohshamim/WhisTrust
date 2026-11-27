import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSubdomainRewrite } from './lib/utils/subdomain';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const destination = getSubdomainRewrite(new URL(request.url), hostname);
  return destination ? NextResponse.rewrite(destination) : NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)'],
};
