/**
 * Admin Login Audit Log API Endpoint
 *
 * POST /api/admin/auth/log-login
 *
 * SECURITY:
 * - Logs successful admin logins to audit trail
 * - Records IP address and user agent
 * - OWASP A09:2021 - Security Logging and Monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminUser, logAdminAction } from '@/lib/auth/admin';
import { getClientIp, getUserAgent } from '@/lib/supabase/server';

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

    // Get request metadata
    const ipAddress = getClientIp(request.headers);
    const userAgent = getUserAgent(request.headers);

    // Parse request body
    const body = await request.json();
    const { action, success = true } = body;

    // Log the admin action
    await logAdminAction({
      adminId: verificationResult.adminUser.id,
      adminEmail: verificationResult.adminUser.email,
      action: action || 'admin.login',
      resourceType: 'auth',
      details: {
        adminLevel: verificationResult.adminUser.adminLevel,
        loginTime: new Date().toISOString(),
      },
      ipAddress: ipAddress || undefined,
      userAgent: userAgent || undefined,
      success,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login audit log error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
