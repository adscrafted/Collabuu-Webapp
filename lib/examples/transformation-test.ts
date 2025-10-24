/**
 * Quick Verification Test for Campaign Payload Transformation
 *
 * This file can be run to verify the transformation logic works correctly.
 * Run with: npx ts-node lib/examples/transformation-test.ts
 */

import { CampaignType, CampaignStatus } from '@/lib/types/campaign';

// Copy of the transformation function for testing
function transformToIOSPayload(data: any, imageUrl: string) {
  const paymentTypeMap: Record<CampaignType, 'pay_per_customer' | 'media_event' | 'rewards'> = {
    [CampaignType.PAY_PER_CUSTOMER]: 'pay_per_customer',
    [CampaignType.MEDIA_EVENT]: 'media_event',
    [CampaignType.REWARDS]: 'rewards',
  };

  const paymentType = paymentTypeMap[data.type as CampaignType];

  let creditsPerAction = 0;
  let totalCredits = data.budget.totalCredits;
  let influencerSpots = data.budget.influencerSpots || data.budget.maxVisits || 0;

  if (paymentType === 'pay_per_customer') {
    creditsPerAction = data.budget.creditsPerVisit || 0;
  } else if (paymentType === 'media_event') {
    totalCredits = 300;
    creditsPerAction = 300;
  } else if (paymentType === 'rewards') {
    totalCredits = 0;
    influencerSpots = 0;
    creditsPerAction = data.budget.rewardValue || 0;
  }

  const requirementsString = data.requirements ? JSON.stringify(data.requirements) : '';

  const statusMap: Record<CampaignStatus, 'active' | 'draft'> = {
    [CampaignStatus.DRAFT]: 'draft',
    [CampaignStatus.ACTIVE]: 'active',
    [CampaignStatus.PAUSED]: 'active',
    [CampaignStatus.COMPLETED]: 'active',
    [CampaignStatus.CANCELLED]: 'draft',
  };

  const visibility = paymentType === 'rewards' ? 'public' : 'public';

  return {
    title: data.title,
    description: data.description,
    paymentType,
    visibility,
    status: statusMap[data.status as CampaignStatus],
    requirements: requirementsString,
    influencerSpots,
    periodStart: data.startDate,
    periodEnd: data.endDate,
    creditsPerAction,
    creditsPerCustomer: paymentType === 'pay_per_customer' ? data.budget.creditsPerVisit : undefined,
    totalCredits,
    imageUrl: imageUrl || '',
  };
}

// Test 1: Pay Per Customer
console.log('='.repeat(80));
console.log('TEST 1: Pay Per Customer Campaign');
console.log('='.repeat(80));

const payPerCustomer = {
  type: CampaignType.PAY_PER_CUSTOMER,
  title: 'Summer Lunch Special',
  description: 'Bring influencers to try our new summer menu',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-08-31T23:59:59.999Z',
  budget: {
    totalCredits: 5000,
    creditsPerVisit: 50,
    maxVisits: 100,
  },
  requirements: {
    minFollowerCount: 1000,
    requiredHashtags: ['#SummerMenu', '#Foodie'],
  },
  status: CampaignStatus.ACTIVE,
};

const result1 = transformToIOSPayload(payPerCustomer, 'https://example.com/image.jpg');
console.log(JSON.stringify(result1, null, 2));

// Verify
console.log('\nVerifications:');
console.log('✓ paymentType:', result1.paymentType === 'pay_per_customer' ? 'PASS' : 'FAIL');
console.log('✓ creditsPerAction:', result1.creditsPerAction === 50 ? 'PASS' : 'FAIL');
console.log('✓ creditsPerCustomer:', result1.creditsPerCustomer === 50 ? 'PASS' : 'FAIL');
console.log('✓ totalCredits:', result1.totalCredits === 5000 ? 'PASS' : 'FAIL');
console.log('✓ influencerSpots:', result1.influencerSpots === 100 ? 'PASS' : 'FAIL');

// Test 2: Media Event
console.log('\n' + '='.repeat(80));
console.log('TEST 2: Media Event Campaign');
console.log('='.repeat(80));

const mediaEvent = {
  type: CampaignType.MEDIA_EVENT,
  title: 'Grand Opening Event',
  description: 'Cover our grand opening',
  startDate: '2025-07-15T18:00:00.000Z',
  endDate: '2025-07-15T22:00:00.000Z',
  budget: {
    totalCredits: 500,
    influencerSpots: 5,
  },
  status: CampaignStatus.ACTIVE,
};

const result2 = transformToIOSPayload(mediaEvent, 'https://example.com/event.jpg');
console.log(JSON.stringify(result2, null, 2));

// Verify
console.log('\nVerifications:');
console.log('✓ paymentType:', result2.paymentType === 'media_event' ? 'PASS' : 'FAIL');
console.log('✓ creditsPerAction:', result2.creditsPerAction === 300 ? 'PASS (FORCED)' : 'FAIL');
console.log('✓ totalCredits:', result2.totalCredits === 300 ? 'PASS (FORCED from 500)' : 'FAIL');
console.log('✓ influencerSpots:', result2.influencerSpots === 5 ? 'PASS' : 'FAIL');

// Test 3: Rewards
console.log('\n' + '='.repeat(80));
console.log('TEST 3: Loyalty Rewards Campaign');
console.log('='.repeat(80));

const rewards = {
  type: CampaignType.REWARDS,
  title: 'VIP Member Rewards',
  description: 'Exclusive rewards',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-12-31T23:59:59.999Z',
  budget: {
    totalCredits: 1000,
    rewardValue: 25,
  },
  status: CampaignStatus.ACTIVE,
};

const result3 = transformToIOSPayload(rewards, 'https://example.com/rewards.jpg');
console.log(JSON.stringify(result3, null, 2));

// Verify
console.log('\nVerifications:');
console.log('✓ paymentType:', result3.paymentType === 'rewards' ? 'PASS' : 'FAIL');
console.log('✓ creditsPerAction:', result3.creditsPerAction === 25 ? 'PASS' : 'FAIL');
console.log('✓ totalCredits:', result3.totalCredits === 0 ? 'PASS (FORCED from 1000)' : 'FAIL');
console.log('✓ influencerSpots:', result3.influencerSpots === 0 ? 'PASS (FORCED)' : 'FAIL');
console.log('✓ visibility:', result3.visibility === 'public' ? 'PASS (FORCED)' : 'FAIL');

console.log('\n' + '='.repeat(80));
console.log('All transformation tests completed!');
console.log('='.repeat(80));
