# Campaign API Integration Update Summary

## Overview
Updated the webapp's API integration layer to send campaign data in the format expected by the iOS backend API. The transformation happens transparently in the hooks layer before data is sent to the API.

## Files Modified

### 1. `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/hooks/use-create-campaign.ts`

**Changes:**
- Added `IOSCampaignPayload` interface matching iOS API expectations
- Created `transformToIOSPayload()` function to convert webapp data to iOS format
- Updated `useCreateCampaign` hook to transform data before sending
- Updated `useSaveDraft` hook to transform data before sending

**Key Transformation Logic:**
```typescript
function transformToIOSPayload(data: CreateCampaignRequest, imageUrl: string): IOSCampaignPayload
```

### 2. `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/api/campaigns.ts`

**Changes:**
- Added `IOSCampaignPayload` interface
- Updated `createCampaign()` to accept either format (maintains backward compatibility)
- Added documentation clarifying expected payload format

### 3. `/Users/anthony/Documents/Projects/Collabuu-Webapp/lib/examples/campaign-payload-examples.ts` (NEW)

**Purpose:**
- Provides concrete examples of payload transformations for all campaign types
- Documents field mapping reference
- Explains special rules for each campaign type

## Field Mapping

### Direct Mappings
| Webapp Field | iOS Field |
|--------------|-----------|
| `title` | `title` |
| `description` | `description` |
| `imageUrl` | `imageUrl` |

### Renamed Fields
| Webapp Field | iOS Field |
|--------------|-----------|
| `type` | `paymentType` |
| `startDate` | `periodStart` |
| `endDate` | `periodEnd` |
| `budget.creditsPerVisit` | `creditsPerAction` (pay_per_customer) |
| `budget.maxVisits` | `influencerSpots` |
| `requirements` (object) | `requirements` (JSON string) |

### New Fields (iOS Only)
- `visibility` - Hardcoded to "public" (forced for rewards campaigns)
- `creditsPerCustomer` - Only included for pay_per_customer type

### Type Conversions
- Campaign type enums → lowercase strings (`PAY_PER_CUSTOMER` → `pay_per_customer`)
- Status enums → lowercase strings (`ACTIVE` → `active`, `DRAFT` → `draft`)
- Requirements object → JSON string

## Campaign Type-Specific Rules

### Pay Per Customer
```typescript
{
  paymentType: 'pay_per_customer',
  creditsPerAction: budget.creditsPerVisit,
  creditsPerCustomer: budget.creditsPerVisit,
  totalCredits: budget.totalCredits,
  influencerSpots: budget.maxVisits
}
```

### Media Event
```typescript
{
  paymentType: 'media_event',
  creditsPerAction: 300,        // FORCED
  totalCredits: 300,             // FORCED (regardless of input)
  influencerSpots: budget.influencerSpots
}
```

### Rewards
```typescript
{
  paymentType: 'rewards',
  creditsPerAction: budget.rewardValue,
  totalCredits: 0,               // FORCED
  influencerSpots: 0,            // FORCED
  visibility: 'public'           // FORCED
}
```

## Example Transformations

### Example 1: Pay Per Customer Campaign

**Input (Webapp):**
```typescript
{
  type: CampaignType.PAY_PER_CUSTOMER,
  title: 'Summer Lunch Special',
  description: 'Bring influencers to try our new summer menu',
  imageUrl: 'https://example.com/image.jpg',
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
}
```

**Output (iOS API):**
```typescript
{
  title: 'Summer Lunch Special',
  description: 'Bring influencers to try our new summer menu',
  paymentType: 'pay_per_customer',
  visibility: 'public',
  status: 'active',
  requirements: '{"minFollowerCount":1000,"requiredHashtags":["#SummerMenu","#Foodie"]}',
  influencerSpots: 100,
  periodStart: '2025-06-01T00:00:00.000Z',
  periodEnd: '2025-08-31T23:59:59.999Z',
  creditsPerAction: 50,
  creditsPerCustomer: 50,
  totalCredits: 5000,
  imageUrl: 'https://example.com/image.jpg',
}
```

### Example 2: Media Event Campaign

**Input (Webapp):**
```typescript
{
  type: CampaignType.MEDIA_EVENT,
  title: 'Grand Opening Event',
  description: 'Cover our grand opening event',
  imageUrl: 'https://example.com/event.jpg',
  startDate: '2025-07-15T18:00:00.000Z',
  endDate: '2025-07-15T22:00:00.000Z',
  budget: {
    totalCredits: 500,  // Will be forced to 300
    influencerSpots: 5,
  },
  status: CampaignStatus.ACTIVE,
}
```

**Output (iOS API):**
```typescript
{
  title: 'Grand Opening Event',
  description: 'Cover our grand opening event',
  paymentType: 'media_event',
  visibility: 'public',
  status: 'active',
  requirements: '',
  influencerSpots: 5,
  periodStart: '2025-07-15T18:00:00.000Z',
  periodEnd: '2025-07-15T22:00:00.000Z',
  creditsPerAction: 300,    // FORCED
  totalCredits: 300,         // FORCED (not 500)
  imageUrl: 'https://example.com/event.jpg',
}
```

### Example 3: Loyalty Rewards Campaign

**Input (Webapp):**
```typescript
{
  type: CampaignType.LOYALTY_REWARD,
  title: 'VIP Member Rewards',
  description: 'Exclusive rewards for our loyal customers',
  imageUrl: 'https://example.com/rewards.jpg',
  startDate: '2025-06-01T00:00:00.000Z',
  endDate: '2025-12-31T23:59:59.999Z',
  budget: {
    totalCredits: 1000,  // Will be forced to 0
    rewardValue: 25,
    maxRedemptionsPerCustomer: 4,
  },
  status: CampaignStatus.ACTIVE,
}
```

**Output (iOS API):**
```typescript
{
  title: 'VIP Member Rewards',
  description: 'Exclusive rewards for our loyal customers',
  paymentType: 'rewards',
  visibility: 'public',      // FORCED
  status: 'active',
  requirements: '',
  influencerSpots: 0,        // FORCED
  periodStart: '2025-06-01T00:00:00.000Z',
  periodEnd: '2025-12-31T23:59:59.999Z',
  creditsPerAction: 25,
  totalCredits: 0,           // FORCED (not 1000)
  imageUrl: 'https://example.com/rewards.jpg',
}
```

## Status Mapping

| Webapp Status | iOS Status |
|---------------|------------|
| `DRAFT` | `draft` |
| `ACTIVE` | `active` |
| `PAUSED` | `active` |
| `COMPLETED` | `active` |
| `CANCELLED` | `draft` |

## Testing Recommendations

1. **Test each campaign type** to ensure proper transformation
2. **Verify forced values** (media event = 300 credits, rewards = 0 credits)
3. **Check requirements serialization** (object → JSON string)
4. **Validate date formats** (ISO8601 strings)
5. **Test draft and active status** transformations
6. **Verify image upload integration** works with new payload format

## Backward Compatibility

The `campaignsApi.createCampaign()` function accepts both:
- `IOSCampaignPayload` (new format - already transformed)
- `CreateCampaignRequest` (old format - should be transformed by caller)

This ensures existing code won't break if there are other places calling the API directly.

## Next Steps

1. Test campaign creation with all three types
2. Verify backend correctly receives and processes the iOS format
3. Check that campaign detail/edit flows still work correctly
4. Update any other areas that might be creating campaigns directly
