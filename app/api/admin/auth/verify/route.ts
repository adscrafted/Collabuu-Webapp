/**
 * Admin Verification API Endpoint
 *
 * POST /api/admin/auth/verify
 *
 * SECURITY:
 * - Verifies JWT token
 * - Checks admin role in user_metadata
 * - Validates admin_users table entry
 * - Checks account status and locks
 *
 * This endpoint is called after successful authentication to verify
 * that the user has admin privileges and their account is active.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/auth/admin';
import { getClientIp, getUserAgent } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: 'Missing or invalid authorization header',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify admin status
    const verificationResult = await verifyAdminUser(token);

    if (!verificationResult.isAdmin) {
      return NextResponse.json(
        {
          error: verificationResult.error || 'Access denied. Admin privileges required.',
          code: 'ACCESS_DENIED',
        },
        { status: 403 }
      );
    }

    if (verificationResult.isLocked) {
      return NextResponse.json(
        {
          error: verificationResult.error || 'Account is temporarily locked',
          code: 'ACCOUNT_LOCKED',
        },
        { status: 423 } // 423 Locked
      );
    }

    if (!verificationResult.isActive) {
      return NextResponse.json(
        {
          error: verificationResult.error || 'Admin account is not active',
          code: 'ACCOUNT_INACTIVE',
        },
        { status: 403 }
      );
    }

    // Return admin user details
    return NextResponse.json({
      success: true,
      role: verificationResult.adminUser!.role,
      adminLevel: verificationResult.adminUser!.adminLevel,
      permissions: verificationResult.adminUser!.permissions,
      email: verificationResult.adminUser!.email,
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during verification',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
