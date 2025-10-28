import { NextResponse } from 'next/server';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: string;
  field?: string;
  timestamp: string;
}

/**
 * Create a standardized error response
 *
 * @param error - Human-readable error message
 * @param status - HTTP status code
 * @param options - Additional error context
 * @returns NextResponse with standardized error format
 *
 * @example
 * return createErrorResponse('Campaign not found', 404);
 *
 * @example
 * return createErrorResponse('Invalid campaign type', 400, {
 *   code: 'INVALID_TYPE',
 *   field: 'campaignType',
 *   details: 'Must be one of: pay_per_customer, pay_per_post, media_event, loyalty_reward'
 * });
 */
export function createErrorResponse(
  error: string,
  status: number,
  options?: {
    code?: string;
    details?: string;
    field?: string;
  }
): NextResponse {
  const response: ApiErrorResponse = {
    error,
    timestamp: new Date().toISOString(),
    ...options
  };

  return NextResponse.json(response, { status });
}

/**
 * Common error codes for API responses
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation errors
  INVALID_TYPE: 'INVALID_TYPE',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_RANGE: 'INVALID_RANGE',
  MISSING_FIELD: 'MISSING_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  FORBIDDEN: 'FORBIDDEN',

  // Business logic errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  CAMPAIGN_FULL: 'CAMPAIGN_FULL',
  CAMPAIGN_ENDED: 'CAMPAIGN_ENDED',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
