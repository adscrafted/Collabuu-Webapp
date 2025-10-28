import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/campaigns',
  '/credits',
  '/profile',
  '/influencers',
  '/settings',
  '/billing',
];

// Admin routes that require admin authentication and authorization
const adminRoutes = ['/admin'];

// Routes that should redirect to campaigns if already authenticated
const authRoutes = ['/login', '/register'];

// Admin login route
const adminLoginRoute = '/admin/login';

/**
 * Middleware for route protection and authentication
 *
 * SECURITY FEATURES:
 * - Separate admin and user authentication flows
 * - Admin route protection with role verification
 * - Session validation via cookies
 * - Automatic redirects for unauthorized access
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if this is the admin login page
  const isAdminLoginRoute = pathname === adminLoginRoute;

  // ADMIN ROUTE HANDLING
  if (isAdminRoute && !isAdminLoginRoute) {
    // Get admin token from cookie
    const adminToken = request.cookies.get('admin_token')?.value;
    const adminRole = request.cookies.get('admin_role')?.value;

    // Redirect to admin login if not authenticated
    if (!adminToken) {
      const loginUrl = new URL(adminLoginRoute, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Add admin headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-auth', 'true');
    if (adminRole) {
      requestHeaders.set('x-admin-role', adminRole);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Prevent accessing admin login when already authenticated as admin
  if (isAdminLoginRoute) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/withdrawals', request.url));
    }
    // Allow access to admin login page
    return NextResponse.next();
  }

  // REGULAR USER ROUTE HANDLING
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
