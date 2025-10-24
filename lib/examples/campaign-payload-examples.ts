/**
 * Campaign Payload Transformation Examples
 *
 * This file demonstrates how webapp campaign data is transformed
 * to match the iOS API payload format.
 */

import { CreateCampaignRequest, CampaignType, CampaignStatus } from '@/lib/types/campaign';

// ============================================================================
// EXAMPLE 1: Pay Per Customer Campaign
// ============================================================================

export const payPerCustomerWebappData: CreateCampaignRequest = {
  type: CampaignType.PAY_PER_CUSTOMER,
  title: 'Summer Lunch Special',
  description: 'Bring influencers to try our new summer menu',
  imageUrl: 'https://example.com/image.jpg',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-08-31T23:59:59.999Z',
  budget: {
    totalCredits: 5000,
    creditsPerCustomer: 50,
    maxVisits: 100,
  },
  requirements: 'Minimum 1000 followers\nMust use hashtags: #SummerMenu #Foodie',
  visibility: 'public',
  status: CampaignStatus.ACTIVE,
};

export const payPerCustomerIOSPayload = {
  title: 'Summer Lunch Special',
  description: 'Bring influencers to try our new summer menu',
  paymentType: 'pay_per_customer' as const,
  visibility: 'public' as const,
  status: 'active' as const,
  requirements: 'Minimum 1000 followers\nMust use hashtags: #SummerMenu #Foodie',
  influencerSpots: 100,
  periodStart: '2025-06-01T00:00:00.000Z',
  periodEnd: '2025-08-31T23:59:59.999Z',
  creditsPerAction: 50,
  creditsPerCustomer: 50,
  totalCredits: 5000,
  imageUrl: 'https://example.com/image.jpg',
};

// ============================================================================
// EXAMPLE 2: Media Event Campaign
// ============================================================================

export const mediaEventWebappData: CreateCampaignRequest = {
  type: CampaignType.MEDIA_EVENT,
  title: 'Grand Opening Event',
  description: 'Cover our grand opening event with photos and videos',
  imageUrl: 'https://example.com/event.jpg',
  startDate: '2025-07-15T18:00:00.000Z',
  endDate: '2025-07-15T22:00:00.000Z',
  budget: {
    totalCredits: 500, // This will be forced to 300
    influencerSpots: 5,
  },
  requirements: 'Minimum 5000 followers\nMust be local to San Francisco',
  visibility: 'public',
  status: CampaignStatus.ACTIVE,
};

export const mediaEventIOSPayload = {
  title: 'Grand Opening Event',
  description: 'Cover our grand opening event with photos and videos',
  paymentType: 'media_event' as const,
  visibility: 'public' as const,
  status: 'active' as const,
  requirements: 'Minimum 5000 followers\nMust be local to San Francisco',
  influencerSpots: 5,
  periodStart: '2025-07-15T18:00:00.000Z',
  periodEnd: '2025-07-15T22:00:00.000Z',
  creditsPerAction: 300, // Fixed for media events
  totalCredits: 300, // FORCED to 300 regardless of input
  imageUrl: 'https://example.com/event.jpg',
};

// ============================================================================
// EXAMPLE 3: Loyalty Rewards Campaign
// ============================================================================

export const loyaltyRewardWebappData: CreateCampaignRequest = {
  type: CampaignType.REWARDS,
  title: 'VIP Member Rewards',
  description: 'Exclusive rewards for our loyal customers',
  imageUrl: 'https://example.com/rewards.jpg',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-12-31T23:59:59.999Z',
  budget: {
    totalCredits: 1000, // This will be forced to 0
    rewardValue: 25,
  },
  requirements: 'Minimum 500 followers',
  visibility: 'public',
  status: CampaignStatus.ACTIVE,
};

export const loyaltyRewardIOSPayload = {
  title: 'VIP Member Rewards',
  description: 'Exclusive rewards for our loyal customers',
  paymentType: 'rewards' as const,
  visibility: 'public' as const, // FORCED to public for rewards
  status: 'active' as const,
  requirements: 'Minimum 500 followers',
  influencerSpots: 0, // FORCED to 0 for rewards
  periodStart: '2025-06-01T00:00:00.000Z',
  periodEnd: '2025-12-31T23:59:59.999Z',
  creditsPerAction: 25,
  totalCredits: 0, // FORCED to 0 for rewards
  imageUrl: 'https://example.com/rewards.jpg',
};

// ============================================================================
// EXAMPLE 4: Draft Campaign
// ============================================================================

export const draftCampaignWebappData: CreateCampaignRequest = {
  type: CampaignType.PAY_PER_CUSTOMER,
  title: 'Incomplete Campaign',
  description: 'Still working on the details',
  imageUrl: 'https://example.com/draft.jpg',
  startDate: '2025-09-01T00:00:00.000Z',
  endDate: '2025-09-30T23:59:59.999Z',
  budget: {
    totalCredits: 2000,
    creditsPerCustomer: 40,
    maxVisits: 50,
  },
  requirements: 'No special requirements',
  visibility: 'public',
  status: CampaignStatus.DRAFT,
};

export const draftCampaignIOSPayload = {
  title: 'Incomplete Campaign',
  description: 'Still working on the details',
  paymentType: 'pay_per_customer' as const,
  visibility: 'public' as const,
  status: 'draft' as const, // Lowercase status
  requirements: '', // Empty string when no requirements
  influencerSpots: 50,
  periodStart: '2025-09-01T00:00:00.000Z',
  periodEnd: '2025-09-30T23:59:59.999Z',
  creditsPerAction: 40,
  creditsPerCustomer: 40,
  totalCredits: 2000,
  imageUrl: 'https://example.com/draft.jpg',
};

// ============================================================================
// Field Mapping Reference
// ============================================================================

export const fieldMappingReference = {
  // Direct mappings
  title: 'title → title',
  description: 'description → description',
  imageUrl: 'imageUrl → imageUrl',

  // Type conversions
  type: 'type (CampaignType enum) → paymentType (lowercase string)',
  status: 'status (CampaignStatus enum) → status (lowercase string)',

  // Date field renames
  startDate: 'startDate → periodStart',
  endDate: 'endDate → periodEnd',

  // Budget field transformations
  creditsPerVisit: 'budget.creditsPerVisit → creditsPerAction (pay_per_customer)',
  rewardValue: 'budget.rewardValue → creditsPerAction (rewards)',
  fixedAmount: '300 → creditsPerAction (media_event)',
  totalCredits: 'budget.totalCredits → totalCredits (with special rules)',
  maxVisits: 'budget.maxVisits → influencerSpots',
  influencerSpots: 'budget.influencerSpots → influencerSpots',

  // New fields
  visibility: 'Hardcoded to "public"',
  creditsPerCustomer: 'Only for pay_per_customer type',

  // Object to string conversion
  requirements: 'requirements (object) → requirements (JSON string)',
};

// ============================================================================
// Special Rules Summary
// ============================================================================

export const specialRules = {
  media_event: {
    totalCredits: 'FORCED to 300',
    creditsPerAction: 'FORCED to 300',
    description: 'Fixed pricing for media events',
  },
  rewards: {
    totalCredits: 'FORCED to 0',
    influencerSpots: 'FORCED to 0',
    visibility: 'FORCED to "public"',
    description: 'Rewards are always public and have no total credits limit',
  },
  pay_per_customer: {
    creditsPerCustomer: 'Set to creditsPerAction value',
    description: 'Variable pricing based on visits',
  },
};
