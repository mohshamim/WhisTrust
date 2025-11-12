import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;
  
  // Extract subdomain
  const subdomain = extractSubdomain(hostname);
  
  // Skip middleware for certain paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files (favicon, images, etc.)
  ) {
    return NextResponse.next();
  }
  
  // Handle subdomains
  if (subdomain) {
    // Demo subdomain → /demo
    if (subdomain === 'demo') {
      if (!pathname.startsWith('/demo')) {
        return NextResponse.rewrite(new URL(`/demo${pathname}`, request.url));
      }
      return NextResponse.next();
    }
    
    // Super Admin subdomain → /superadmin
    if (subdomain === 'superadmin') {
      if (!pathname.startsWith('/superadmin')) {
        return NextResponse.rewrite(new URL(`/superadmin${pathname}`, request.url));
      }
      return NextResponse.next();
    }
    
    // Client tenant subdomain → /org/[subdomain]
    // Example: acme.whistrust.app → /org/acme
    if (!pathname.startsWith('/org/')) {
      return NextResponse.rewrite(
        new URL(`/org/${subdomain}${pathname}`, request.url)
      );
    }
  }
  
  return NextResponse.next();
}

function extractSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0];
  
  // Main domains (no subdomain)
  const mainDomains = [
    'whistrust.com',
    'www.whistrust.com',
    'whistrust.app',
    'www.whistrust.app',
    'localhost',
  ];
  
  if (mainDomains.includes(host)) {
    return null;
  }
  
  // Extract subdomain
  const parts = host.split('.');
  
  if (parts.length >= 2) {
    return parts[0];
  }
  
  return null;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
