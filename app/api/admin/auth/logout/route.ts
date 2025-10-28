/**
 * Admin Logout API Endpoint
 *
 * POST /api/admin/auth/logout
 *
 * SECURITY:
 * - Logs admin logout for audit trail
 * - Invalidates session
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser, logAdminAction } from '@/lib/auth/admin';
import { getClientIp, getUserAgent } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

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

    // Verify admin status (before logout)
    const verificationResult = await verifyAdminUser(token);

    if (verificationResult.isAdmin && verificationResult.adminUser) {
      // Get request metadata
      const ipAddress = getClientIp(request.headers);
      const userAgent = getUserAgent(request.headers);

      // Log the logout action
      await logAdminAction({
        adminId: verificationResult.adminUser.id,
        adminEmail: verificationResult.adminUser.email,
        action: 'admin.logout',
        resourceType: 'auth',
        details: {
          adminLevel: verificationResult.adminUser.adminLevel,
          logoutTime: new Date().toISOString(),
        },
        ipAddress: ipAddress || undefined,
        userAgent: userAgent || undefined,
        success: true,
      });
    }

    // Sign out from Supabase
    const supabase = createServiceRoleClient();
    await supabase.auth.admin.signOut(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
