import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/campaigns',
  '/credits',
  '/profile',
  '/influencers',
  '/settings',
  '/team',
  '/billing',
];

// Routes that should redirect to campaigns if already authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie or authorization header
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const isAuthenticated = !!token;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is an auth route (login/register)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to campaigns if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/campaigns', request.url));
  }

  // For authenticated requests to protected routes, add business-id header if available
  if (isProtectedRoute && isAuthenticated) {
    const businessId = request.cookies.get('business_id')?.value;

    if (businessId) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-business-id', businessId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // Allow all other requests to proceed
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
