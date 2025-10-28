/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  limit: 100, // requests per window
  windowMs: 3600000, // 1 hour in milliseconds
};

/**
 * Get rate limit headers for API responses
 *
 * @param remaining - Number of requests remaining (optional, defaults to limit - 1)
 * @returns Headers object with rate limit information
 */
export function getRateLimitHeaders(remaining?: number): Record<string, string> {
  const resetTime = new Date(Date.now() + RATE_LIMIT_CONFIG.windowMs);

  return {
    'X-RateLimit-Limit': RATE_LIMIT_CONFIG.limit.toString(),
    'X-RateLimit-Remaining': (remaining ?? (RATE_LIMIT_CONFIG.limit - 1)).toString(),
    'X-RateLimit-Reset': resetTime.toISOString(),
  };
}
