/**
 * Simple in-memory rate limiter for authentication endpoints
 * In production, this should use Redis or a similar distributed cache
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store (note: this resets on server restart)
const rateLimitMap = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  uniqueIdentifier: string // IP address or user ID
  limit: number // Maximum number of requests
  windowMs: number // Time window in milliseconds
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

export function checkRateLimit(config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const key = `ratelimit:${config.uniqueIdentifier}`

  let entry = rateLimitMap.get(key)

  // Create or reset entry if expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    }
  }

  // Increment counter
  entry.count++
  rateLimitMap.set(key, entry)

  const allowed = entry.count <= config.limit
  const remaining = Math.max(0, config.limit - entry.count)
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000)

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
    retryAfter,
  }
}

// Rate limit configurations for different endpoints
export const RATE_LIMITS = {
  REGISTRATION: {
    limit: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // per hour
  },
  LOGIN: {
    limit: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },
  PASSWORD_RESET: {
    limit: 3, // 3 attempts
    windowMs: 60 * 60 * 1000, // per hour
  },
  API_GENERAL: {
    limit: 100, // 100 requests
    windowMs: 60 * 1000, // per minute
  },
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  // Check various headers for IP address (in order of preference)
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-client-ip',
    'x-cluster-client-ip',
  ]

  for (const header of ipHeaders) {
    const value = headers.get(header)
    if (value) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return value.split(',')[0].trim()
    }
  }

  return 'unknown'
}
