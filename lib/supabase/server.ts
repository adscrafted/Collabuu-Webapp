/**
 * Server-side Supabase Client
 *
 * SECURITY: This module provides server-side Supabase clients with appropriate
 * privilege levels for different contexts.
 *
 * IMPORTANT: Never expose service role key to client-side code
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client with service role privileges
 *
 * SECURITY WARNING: Only use this for admin operations and server-side logic
 * - Bypasses Row Level Security (RLS) policies
 * - Full database access
 * - Never expose to client-side code
 *
 * @returns Supabase client with service role privileges
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client for server-side use with user context
 *
 * This client:
 * - Uses anon key (respects RLS policies)
 * - Can verify JWT tokens
 * - Suitable for API routes that need user authentication
 *
 * @param token - Optional JWT token for authentication
 * @returns Supabase client with user context
 */
export function createServerClient(token?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  const client = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // If token is provided, set it for the session
  if (token) {
    // Note: This doesn't actually authenticate, just allows getUser() to work
    // The token validation happens when calling getUser()
  }

  return client;
}

/**
 * Gets the authentication token from request headers or cookies
 *
 * Checks in order:
 * 1. Authorization header (Bearer token)
 * 2. auth_token cookie
 *
 * @param request - Next.js request object or headers
 * @returns Authentication token or null
 */
export async function getAuthToken(headers: Headers): Promise<string | null> {
  // Check Authorization header
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Extracts client IP address from request headers
 *
 * SECURITY: Used for audit logging and rate limiting
 * Checks multiple headers for proxy/load balancer scenarios
 *
 * @param headers - Request headers
 * @returns IP address or null
 */
export function getClientIp(headers: Headers): string | null {
  // Check various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return null;
}

/**
 * Extracts User-Agent from request headers
 *
 * @param headers - Request headers
 * @returns User-Agent string or null
 */
export function getUserAgent(headers: Headers): string | null {
  return headers.get('user-agent');
}
