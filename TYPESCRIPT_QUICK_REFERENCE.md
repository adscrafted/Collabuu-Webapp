# TypeScript Dead Code Analysis - Quick Reference Card

## Critical Issues - Fix First

### 1. Unsafe Type Assertion in Stripe Webhook
**File:** `/app/api/stripe/webhook/route.ts:78`

```typescript
// ❌ BAD
const paymentIntentId = session.payment_intent as string;

// ✅ GOOD
const paymentIntentId =
  typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

if (!paymentIntentId) {
  throw new Error('Missing payment intent ID');
}
```

### 2. Type Assertion to 'any' in Campaign Overview
**File:** `/components/campaigns/detail/overview-tab.tsx:34`

```typescript
// ❌ BAD
const shareLink = (campaign as any).shareLink || `https://...`;

// ✅ STEP 1: Update interface in lib/types/campaign.ts
export interface Campaign {
  // ... existing fields
  shareLink?: string;
}

// ✅ STEP 2: Fix the component
const shareLink = campaign.shareLink || `https://collabuu.app/c/${campaignId}`;
```

### 3. Unsafe Query Param Assertions
**File:** `/components/campaigns/campaign-filters.tsx`

```typescript
// ❌ BAD
const statusArray = status.split(',') as CampaignStatus[];

// ✅ GOOD
const isCampaignStatus = (val: string): val is CampaignStatus =>
  ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(val);

const statusArray = status.split(',').filter(isCampaignStatus);
```

---

## Duplicate Types to Consolidate

### LoginResponse & RegisterResponse
```typescript
// In use-login.ts and use-register.ts
// ❌ REMOVE local definitions

// ✅ ADD import
import type { LoginResponse, RegisterResponse } from '@/lib/types/auth';
```

### User & AuthState
```typescript
// In lib/stores/auth-store.ts
// ❌ REMOVE duplicate interfaces

// ✅ ADD imports
import type { User, AuthState as BaseAuthState } from '@/lib/types/auth';

interface AuthState extends BaseAuthState {
  // Only store methods here
}
```

### CampaignFormData
```typescript
// In lib/types/campaign.ts
// ❌ REMOVE interface definition

// ✅ RE-EXPORT from validation
export type { CampaignFormData } from '@/lib/validation/campaign-schema';
```

---

## Files with Unused Types to Clean

| File | Lines to Delete | Count |
|------|----------------|-------|
| `lib/constants/colors.ts` | 111-117 | 7 types |
| `lib/constants/spacing.ts` | 99-105 | 6 types |
| `lib/constants/typography.ts` | 75-80 | 4 types |
| `lib/types/auth.ts` | 16-83 | 8 types |
| `lib/types/profile.ts` | 88, 222, 294, 302 | 4 types |
| `lib/validation/campaign-schema.ts` | 153-156 | 4 types |
| `lib/validation/profile-schema.ts` | 64, 145, 162 | 3 types |
| `lib/constants/index.ts` | 37 | 1 type |

---

## tsconfig.json Updates

```json
{
  "compilerOptions": {
    // Change these from false to true
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    // Add these new options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## Verification Commands

```bash
# 1. Type check
npm run type-check

# 2. Run analyzer
npx tsx analyze-types.ts

# 3. Should show: "Unused types: 0"

# 4. Build
npm run build
```

---

## Files Generated

1. **TYPESCRIPT_DEAD_CODE_ANALYSIS.md** - Full detailed analysis
2. **TYPESCRIPT_FIXES_CHECKLIST.md** - Step-by-step fix instructions
3. **TYPESCRIPT_ANALYSIS_SUMMARY.md** - Executive summary
4. **TYPESCRIPT_QUICK_REFERENCE.md** - This file (quick fixes)
5. **type-analysis-report.json** - Machine-readable data
6. **analyze-types.ts** - Reusable analyzer script

---

## Quick Stats

- **Type Safety Score:** 87/100 → 100/100
- **Unused Types:** 37 → 0
- **Duplicate Types:** 5 → 0
- **Unsafe Assertions:** 7 → 0
- **Estimated Time:** 2-3 hours

---

## One-Command Summary

```bash
# See the full report
cat TYPESCRIPT_DEAD_CODE_ANALYSIS.md

# See line-by-line fixes
cat TYPESCRIPT_FIXES_CHECKLIST.md

# Run the analyzer
npx tsx analyze-types.ts
```
