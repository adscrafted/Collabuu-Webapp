import { createErrorResponse, ErrorCodes } from './api-error';

/**
 * Valid campaign types
 */
export const VALID_CAMPAIGN_TYPES = [
  'pay_per_customer',
  'pay_per_post',
  'media_event',
  'loyalty_reward'
] as const;

export type CampaignType = typeof VALID_CAMPAIGN_TYPES[number];

/**
 * Validation constraints
 */
export const VALIDATION_CONSTRAINTS = {
  CREDITS_PER_CUSTOMER: { min: 1, max: 1000 },
  INFLUENCER_SPOTS: { min: 1, max: 1000 },
  MEDIA_EVENT_SPOTS: { min: 1, max: 50 },
  MEDIA_EVENT_CREDITS: 300,
  LOYALTY_REWARD_CREDITS: 0,
  CAMPAIGN_DURATION: { min: 1, max: 365 }, // days
  STRING_LIMITS: {
    title: 100,
    description: 1000,
    requirements: 2000
  }
} as const;

/**
 * Sanitize string input by trimming and limiting length
 */
export function sanitizeString(input: string | undefined, maxLength: number): string {
  if (!input) return '';
  return input.trim().substring(0, maxLength);
}

/**
 * Validate campaign type
 */
export function validateCampaignType(campaignType: string | undefined) {
  if (!campaignType) {
    return createErrorResponse(
      'Campaign type is required',
      400,
      {
        code: ErrorCodes.MISSING_FIELD,
        field: 'campaignType',
        details: `Valid types: ${VALID_CAMPAIGN_TYPES.join(', ')}`
      }
    );
  }

  if (!VALID_CAMPAIGN_TYPES.includes(campaignType as CampaignType)) {
    return createErrorResponse(
      'Invalid campaign type',
      400,
      {
        code: ErrorCodes.INVALID_TYPE,
        field: 'campaignType',
        details: `Valid types: ${VALID_CAMPAIGN_TYPES.join(', ')}`
      }
    );
  }

  return null;
}

/**
 * Validate Pay Per Customer campaign fields
 */
export function validatePayPerCustomer(body: any) {
  const { creditsPerCustomer, influencerSpots, totalCredits } = body;

  if (!creditsPerCustomer || creditsPerCustomer < VALIDATION_CONSTRAINTS.CREDITS_PER_CUSTOMER.min ||
      creditsPerCustomer > VALIDATION_CONSTRAINTS.CREDITS_PER_CUSTOMER.max) {
    return createErrorResponse(
      `Pay Per Customer campaigns require creditsPerCustomer between ${VALIDATION_CONSTRAINTS.CREDITS_PER_CUSTOMER.min}-${VALIDATION_CONSTRAINTS.CREDITS_PER_CUSTOMER.max}`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'creditsPerCustomer'
      }
    );
  }

  if (!influencerSpots || influencerSpots < VALIDATION_CONSTRAINTS.INFLUENCER_SPOTS.min ||
      influencerSpots > VALIDATION_CONSTRAINTS.INFLUENCER_SPOTS.max) {
    return createErrorResponse(
      `Pay Per Customer campaigns require influencerSpots between ${VALIDATION_CONSTRAINTS.INFLUENCER_SPOTS.min}-${VALIDATION_CONSTRAINTS.INFLUENCER_SPOTS.max}`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'influencerSpots'
      }
    );
  }

  const minCredits = influencerSpots * 150;
  if (!totalCredits || totalCredits < minCredits) {
    return createErrorResponse(
      `Total credits must be at least ${minCredits} (influencerSpots × 150)`,
      400,
      {
        code: ErrorCodes.INSUFFICIENT_CREDITS,
        field: 'totalCredits',
        details: `Minimum required: ${minCredits}`
      }
    );
  }

  return null;
}

/**
 * Validate Media Event campaign fields
 */
export function validateMediaEvent(body: any) {
  const { totalCredits, influencerSpots, eventDate } = body;

  if (totalCredits !== VALIDATION_CONSTRAINTS.MEDIA_EVENT_CREDITS) {
    return createErrorResponse(
      `Media Event campaigns must have exactly ${VALIDATION_CONSTRAINTS.MEDIA_EVENT_CREDITS} total credits`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'totalCredits'
      }
    );
  }

  if (!influencerSpots || influencerSpots < VALIDATION_CONSTRAINTS.MEDIA_EVENT_SPOTS.min ||
      influencerSpots > VALIDATION_CONSTRAINTS.MEDIA_EVENT_SPOTS.max) {
    return createErrorResponse(
      `Media Event campaigns require influencerSpots between ${VALIDATION_CONSTRAINTS.MEDIA_EVENT_SPOTS.min}-${VALIDATION_CONSTRAINTS.MEDIA_EVENT_SPOTS.max}`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'influencerSpots'
      }
    );
  }

  if (!eventDate) {
    return createErrorResponse(
      'Media Event campaigns require eventDate',
      400,
      {
        code: ErrorCodes.MISSING_FIELD,
        field: 'eventDate'
      }
    );
  }

  return null;
}

/**
 * Validate Loyalty Reward campaign fields
 */
export function validateLoyaltyReward(body: any) {
  const { totalCredits, visibility, rewardValue } = body;

  if (totalCredits !== VALIDATION_CONSTRAINTS.LOYALTY_REWARD_CREDITS) {
    return createErrorResponse(
      `Loyalty Reward campaigns must have ${VALIDATION_CONSTRAINTS.LOYALTY_REWARD_CREDITS} total credits`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'totalCredits'
      }
    );
  }

  if (visibility !== 'public') {
    return createErrorResponse(
      'Loyalty Reward campaigns must be public',
      400,
      {
        code: ErrorCodes.INVALID_FORMAT,
        field: 'visibility'
      }
    );
  }

  if (!rewardValue || rewardValue <= 0) {
    return createErrorResponse(
      'Loyalty Reward campaigns require rewardValue > 0',
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'rewardValue'
      }
    );
  }

  return null;
}

/**
 * Validate campaign dates
 */
export function validateCampaignDates(periodStart: string | undefined, periodEnd: string | undefined) {
  if (!periodStart) {
    return createErrorResponse(
      'Start date is required',
      400,
      {
        code: ErrorCodes.MISSING_FIELD,
        field: 'periodStart'
      }
    );
  }

  if (!periodEnd) {
    return createErrorResponse(
      'End date is required',
      400,
      {
        code: ErrorCodes.MISSING_FIELD,
        field: 'periodEnd'
      }
    );
  }

  const startDate = new Date(periodStart);
  const endDate = new Date(periodEnd);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Check for invalid dates
  if (isNaN(startDate.getTime())) {
    return createErrorResponse(
      'Invalid start date format',
      400,
      {
        code: ErrorCodes.INVALID_DATE,
        field: 'periodStart'
      }
    );
  }

  if (isNaN(endDate.getTime())) {
    return createErrorResponse(
      'Invalid end date format',
      400,
      {
        code: ErrorCodes.INVALID_DATE,
        field: 'periodEnd'
      }
    );
  }

  // Start date cannot be in the past
  if (startDate < now) {
    return createErrorResponse(
      'Start date cannot be in the past',
      400,
      {
        code: ErrorCodes.INVALID_DATE,
        field: 'periodStart'
      }
    );
  }

  // End date must be after start date
  if (endDate <= startDate) {
    return createErrorResponse(
      'End date must be after start date',
      400,
      {
        code: ErrorCodes.INVALID_DATE,
        field: 'periodEnd'
      }
    );
  }

  // Calculate duration in days
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = durationMs / (1000 * 60 * 60 * 24);

  if (durationDays < VALIDATION_CONSTRAINTS.CAMPAIGN_DURATION.min) {
    return createErrorResponse(
      `Campaign must be at least ${VALIDATION_CONSTRAINTS.CAMPAIGN_DURATION.min} day long`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'periodEnd',
        details: `Duration: ${durationDays} days`
      }
    );
  }

  if (durationDays > VALIDATION_CONSTRAINTS.CAMPAIGN_DURATION.max) {
    return createErrorResponse(
      `Campaign cannot be longer than ${VALIDATION_CONSTRAINTS.CAMPAIGN_DURATION.max} days`,
      400,
      {
        code: ErrorCodes.INVALID_RANGE,
        field: 'periodEnd',
        details: `Duration: ${durationDays} days`
      }
    );
  }

  return null;
}

/**
 * Validate required string fields
 */
export function validateRequiredFields(body: any) {
  if (!body.title || body.title.trim() === '') {
    return createErrorResponse(
      'Campaign title is required',
      400,
      {
        code: ErrorCodes.MISSING_FIELD,
        field: 'title'
      }
    );
  }

  if (!body.description || body.description.trim() === '') {
    return createErrorResponse(
      'Campaign description is required',
      400,
      {
        code: ErrorCodes.MISSING_FIELD,
        field: 'description'
      }
    );
  }

  return null;
}
