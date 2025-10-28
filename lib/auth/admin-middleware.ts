/**
 * Admin API Middleware
 *
 * Reusable middleware functions for protecting admin API routes
 *
 * SECURITY:
 * - Verifies admin authentication
 * - Checks admin permissions
 * - Enforces rate limiting
 * - Logs admin actions
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminUser,
  hasAdminPermission,
  isRateLimited,
  logAdminAction,
  AdminLevel,
  type AdminUser,
} from '@/lib/auth/admin';
import { getClientIp, getUserAgent } from '@/lib/supabase/server';

/**
 * Context passed to admin API handlers after authentication
 */
export interface AdminContext {
  adminUser: AdminUser;
  ipAddress: string | null;
  userAgent: string | null;
  token: string;
}

/**
 * Result of admin authentication check
 */
export interface AdminAuthResult {
  authorized: boolean;
  context?: AdminContext;
  response?: NextResponse;
}

/**
 * Authenticates and authorizes an admin user for API access
 *
 * SECURITY CHECKS:
 * 1. Validates JWT token
 * 2. Verifies admin role
 * 3. Checks account status (active, not locked)
 * 4. Optionally checks permission level
 * 5. Optionally enforces rate limiting
 *
 * @param request - Next.js request object
 * @param options - Authentication options
 * @returns Authentication result with context or error response
 */
export async function authenticateAdmin(
  request: NextRequest,
  options: {
    requiredLevel?: AdminLevel;
    action?: string;
    rateLimitPerMinute?: number;
  } = {}
): Promise<AdminAuthResult> {
  try {
    // Extract token from authorization header or cookie
    const authHeader = request.headers.get('authorization');
    const cookieToken = request.cookies.get('admin_token')?.value;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (cookieToken) {
      token = cookieToken;
    }

    if (!token) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'Missing authentication token',
            code: 'UNAUTHORIZED',
          },
          { status: 401 }
        ),
      };
    }

    // Verify admin user
    const verificationResult = await verifyAdminUser(token);

    if (!verificationResult.isAdmin) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: verificationResult.error || 'Access denied. Admin privileges required.',
            code: 'ACCESS_DENIED',
          },
          { status: 403 }
        ),
      };
    }

    if (verificationResult.isLocked) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: verificationResult.error || 'Account is temporarily locked',
            code: 'ACCOUNT_LOCKED',
          },
          { status: 423 } // 423 Locked
        ),
      };
    }

    if (!verificationResult.isActive || !verificationResult.adminUser) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: verificationResult.error || 'Admin account is not active',
            code: 'ACCOUNT_INACTIVE',
          },
          { status: 403 }
        ),
      };
    }

    const adminUser = verificationResult.adminUser;

    // Check permission level if required
    if (options.requiredLevel) {
      const hasPermission = hasAdminPermission(adminUser, options.requiredLevel);

      if (!hasPermission) {
        return {
          authorized: false,
          response: NextResponse.json(
            {
              error: 'Insufficient permissions for this action',
              code: 'INSUFFICIENT_PERMISSIONS',
              required: options.requiredLevel,
              current: adminUser.adminLevel,
            },
            { status: 403 }
          ),
        };
      }
    }

    // Check rate limiting if configured
    if (options.action && options.rateLimitPerMinute) {
      const isLimited = await isRateLimited(
        adminUser.id,
        options.action,
        options.rateLimitPerMinute,
        60
      );

      if (isLimited) {
        return {
          authorized: false,
          response: NextResponse.json(
            {
              error: 'Rate limit exceeded. Please try again later.',
              code: 'RATE_LIMITED',
            },
            { status: 429 }
          ),
        };
      }
    }

    // Get request metadata
    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    // Return authorized context
    return {
      authorized: true,
      context: {
        adminUser,
        ipAddress,
        userAgent,
        token,
      },
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: 'Internal server error during authentication',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      ),
    };
  }
}

/**
 * Logs an admin API action
 *
 * Helper function to log actions with context from authenticated admin
 *
 * @param context - Admin context from authenticateAdmin
 * @param action - Action identifier
 * @param resourceType - Resource type
 * @param resourceId - Optional resource ID
 * @param details - Optional additional details
 */
export async function logAdminApiAction(
  context: AdminContext,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  await logAdminAction({
    adminId: context.adminUser.id,
    adminEmail: context.adminUser.email,
    action,
    resourceType,
    resourceId,
    details,
    ipAddress: context.ipAddress || undefined,
    userAgent: context.userAgent || undefined,
    success: true,
  });
}

/**
 * Logs a failed admin API action
 *
 * @param context - Admin context from authenticateAdmin
 * @param action - Action identifier
 * @param resourceType - Resource type
 * @param errorMessage - Error message
 * @param resourceId - Optional resource ID
 */
export async function logAdminApiError(
  context: AdminContext,
  action: string,
  resourceType: string,
  errorMessage: string,
  resourceId?: string
): Promise<void> {
  await logAdminAction({
    adminId: context.adminUser.id,
    adminEmail: context.adminUser.email,
    action,
    resourceType,
    resourceId,
    ipAddress: context.ipAddress || undefined,
    userAgent: context.userAgent || undefined,
    success: false,
    errorMessage,
  });
}

/**
 * Higher-order function to wrap admin API handlers with authentication
 *
 * Usage:
 * ```typescript
 * export const GET = withAdminAuth(
 *   async (request, context) => {
 *     // Your handler logic here
 *     // context.adminUser is guaranteed to exist
 *     return NextResponse.json({ data: 'your data' });
 *   },
 *   { requiredLevel: AdminLevel.MODERATOR }
 * );
 * ```
 */
export function withAdminAuth(
  handler: (request: NextRequest, context: AdminContext) => Promise<NextResponse>,
  options: {
    requiredLevel?: AdminLevel;
    action?: string;
    rateLimitPerMinute?: number;
  } = {}
) {
  return async (request: NextRequest, routeParams?: any): Promise<NextResponse> => {
    const authResult = await authenticateAdmin(request, options);

    if (!authResult.authorized || !authResult.context) {
      return authResult.response!;
    }

    try {
      return await handler(request, authResult.context);
    } catch (error) {
      console.error('Admin API handler error:', error);

      // Log the error
      if (options.action) {
        await logAdminApiError(
          authResult.context,
          options.action,
          'api',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
        },
        { status: 500 }
      );
    }
  };
}
