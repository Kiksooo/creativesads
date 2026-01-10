import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isValidLocale, locales } from './lib/i18n/messages';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Exclude API routes from middleware
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Exclude static files
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If no locale in pathname, redirect to /en
  if (!pathnameHasLocale && pathname !== '/') {
    const locale = 'en';
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  // If root path, redirect to /en
  if (pathname === '/') {
    const newUrl = new URL('/en', request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

