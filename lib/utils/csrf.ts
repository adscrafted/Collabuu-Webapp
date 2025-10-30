/**
 * CSRF (Cross-Site Request Forgery) Protection
 *
 * This implements a simple CSRF token system for protecting state-changing operations.
 * In production, consider using a more robust solution with server-side token storage.
 */

import { cookies } from 'next/headers'

const CSRF_TOKEN_NAME = 'csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Get or create CSRF token for the current session
 * This should be called in server components or API routes
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!token) {
    token = generateToken()
    cookieStore.set(CSRF_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })
  }

  return token
}

/**
 * Validate CSRF token from request
 * This should be called in API routes that handle state-changing operations (POST, PUT, DELETE)
 */
export async function validateCsrfToken(request: Request): Promise<boolean> {
  const cookieStore = await cookies()
  const expectedToken = cookieStore.get(CSRF_TOKEN_NAME)?.value

  if (!expectedToken) {
    return false
  }

  // Check token in header
  const tokenFromHeader = request.headers.get(CSRF_HEADER_NAME)

  if (!tokenFromHeader) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(expectedToken, tokenFromHeader)
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Client-side hook to get and include CSRF token in requests
 * Usage in React components:
 *
 * const csrfToken = await fetch('/api/csrf-token').then(r => r.json())
 *
 * fetch('/api/some-endpoint', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *     'x-csrf-token': csrfToken.token,
 *   },
 *   body: JSON.stringify(data),
 * })
 */

/**
 * API route to expose CSRF token to client
 * Create this route: app/api/csrf-token/route.ts
 *
 * export async function GET() {
 *   const token = await getCsrfToken()
 *   return NextResponse.json({ token })
 * }
 */
