# Utils Library - Validation and Error Handling

## Quick Reference

### API Error Handling

```typescript
import { createErrorResponse, ErrorCodes } from './api-error';

// Basic error
return createErrorResponse('Campaign not found', 404);

// Error with code and details
return createErrorResponse('Invalid campaign type', 400, {
  code: ErrorCodes.INVALID_TYPE,
  field: 'campaignType',
  details: 'Must be one of: pay_per_customer, pay_per_post, media_event, loyalty_reward'
});
```

### Campaign Validation

```typescript
import {
  validateCampaignType,
  validatePayPerCustomer,
  validateMediaEvent,
  validateLoyaltyReward,
  validateCampaignDates,
  validateRequiredFields,
  sanitizeString,
  VALIDATION_CONSTRAINTS,
} from './campaign-validation';

// Validate campaign type
const typeError = validateCampaignType(campaignType);
if (typeError) return typeError;

// Validate required fields
const fieldsError = validateRequiredFields(body);
if (fieldsError) return fieldsError;

// Type-specific validation
if (campaignType === 'pay_per_customer') {
  const error = validatePayPerCustomer({
    creditsPerCustomer,
    influencerSpots,
    totalCredits,
  });
  if (error) return error;
}

// Validate dates
const dateError = validateCampaignDates(periodStart, periodEnd);
if (dateError) return dateError;

// Sanitize strings
const sanitizedTitle = sanitizeString(
  body.title,
  VALIDATION_CONSTRAINTS.STRING_LIMITS.title
);
```

### Rate Limiting

```typescript
import { getRateLimitHeaders } from './rate-limit';

// Add rate limit headers to response
return NextResponse.json(data, {
  headers: getRateLimitHeaders()
});
```

## Validation Constraints

```typescript
VALIDATION_CONSTRAINTS = {
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
}
```

## Error Codes

- `UNAUTHORIZED` - Missing or invalid authentication
- `INVALID_TOKEN` - Invalid JWT token
- `INVALID_TYPE` - Invalid campaign type
- `INVALID_DATE` - Invalid date format or range
- `INVALID_RANGE` - Value outside allowed range
- `MISSING_FIELD` - Required field not provided
- `INVALID_FORMAT` - Invalid field format
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Resource already exists
- `FORBIDDEN` - User doesn't have permission
- `INSUFFICIENT_CREDITS` - Not enough credits
- `CAMPAIGN_FULL` - Campaign has reached capacity
- `CAMPAIGN_ENDED` - Campaign has ended
- `DATABASE_ERROR` - Database query failed
- `QUERY_FAILED` - Specific query failed
- `INTERNAL_ERROR` - Unexpected server error
- `SERVICE_UNAVAILABLE` - Service temporarily unavailable
