/**
 * Update Admin Last Login API Endpoint
 *
 * POST /api/admin/auth/update-login
 *
 * SECURITY:
 * - Updates last login timestamp
 * - Records IP address
 * - Resets failed login counter
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser, updateAdminLastLogin } from '@/lib/auth/admin';
import { getClientIp } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify admin status
    const verificationResult = await verifyAdminUser(token);

    if (!verificationResult.isAdmin || !verificationResult.adminUser) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get client IP
    const ipAddress = getClientIp(request.headers);

    // Update last login
    await updateAdminLastLogin(
      verificationResult.adminUser.id,
      ipAddress || undefined
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update last login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
