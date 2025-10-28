/**
 * Failed Login Tracking API Endpoint
 *
 * POST /api/admin/auth/failed-login
 *
 * SECURITY:
 * - Tracks failed login attempts by email
 * - Implements account lockout after 5 failures
 * - Prevents brute force attacks
 *
 * OWASP A07:2021 - Identification and Authentication Failures mitigation
 */

import { NextRequest, NextResponse } from 'next/server';
import { incrementFailedLoginAttempts } from '@/lib/auth/admin';
import { getClientIp } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Increment failed login attempts
    const attempts = await incrementFailedLoginAttempts(email);

    // Get client IP for logging
    const ipAddress = getClientIp(request.headers);

    // Log the failed attempt (for monitoring)
    console.warn('Failed admin login attempt:', {
      email: email.substring(0, 3) + '***', // Partial email for privacy
      attempts,
      ip: ipAddress,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      attempts,
      locked: attempts >= 5,
      message: attempts >= 5
        ? 'Account locked due to multiple failed login attempts'
        : `Failed login attempt ${attempts}/5`,
    });
  } catch (error) {
    console.error('Failed login tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
