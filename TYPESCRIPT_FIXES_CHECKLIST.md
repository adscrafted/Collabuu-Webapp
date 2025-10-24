# TypeScript Dead Code - Fixes Checklist

This document provides specific line-by-line fixes for all TypeScript dead code issues identified in the analysis.

---

## Quick Stats
- ❌ **37 unused type definitions** to remove
- ⚠️ **5 duplicate types** to consolidate
- 🔧 **7 unsafe type assertions** to fix
- ⚙️ **3 tsconfig options** to enable

---

## Priority 1: Fix Unsafe Type Assertions

### File: `/app/api/stripe/webhook/route.ts`

#### Fix 1: Remove unnecessary event.data.object assertions (Lines 230, 236, 242, 248)

**Current (unsafe):**
```typescript
case 'checkout.session.completed':
  await handleCheckoutSessionCompleted(
    event.data.object as Stripe.Checkout.Session  // ← Remove this
  );
```

**Fixed:**
```typescript
case 'checkout.session.completed': {
  // TypeScript already knows the type from the case
  await handleCheckoutSessionCompleted(event.data.object);
  break;
}

case 'payment_intent.succeeded': {
  await handlePaymentIntentSucceeded(event.data.object);
  break;
}

case 'payment_intent.payment_failed': {
  await handlePaymentIntentFailed(event.data.object);
  break;
}

case 'charge.refunded': {
  await handleChargeRefunded(event.data.object);
  break;
}
```

#### Fix 2: Properly handle payment_intent (Line 78)

**Current (unsafe):**
```typescript
const paymentIntentId = session.payment_intent as string;
```

**Fixed:**
```typescript
// payment_intent can be string | Stripe.PaymentIntent | null
const paymentIntentId =
  typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

if (!paymentIntentId) {
  throw new Error('Missing payment intent ID in checkout session');
}
```

---

### File: `/components/campaigns/detail/overview-tab.tsx`

#### Fix: Remove type assertion and add shareLink to Campaign type (Line 34)

**Current (unsafe):**
```typescript
const shareLink = (campaign as any).shareLink || `https://collabuu.app/c/${campaignId}`;
```

**Step 1: Update Campaign interface** (`/lib/types/campaign.ts`)
```typescript
export interface Campaign {
  id: string;
  businessId: string;
  // ... existing fields ...
  shareLink?: string;  // ← Add this field
  createdAt: string;
  updatedAt: string;
}
```

**Step 2: Fix the component**
```typescript
const shareLink = campaign.shareLink || `https://collabuu.app/c/${campaignId}`;
```

---

### File: `/components/campaigns/campaign-filters.tsx`

#### Fix: Add type guards instead of assertions (Lines 54, 62, 79)

**Current (unsafe):**
```typescript
const statusArray = status.split(',') as CampaignStatus[];
type: type === 'all' ? undefined : (type as CampaignType),
sortBy: sort as CampaignFilters['sortBy'],
```

**Fixed:**
```typescript
// Add type guards at the top of the file
const VALID_STATUSES: readonly CampaignStatus[] = [
  'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
] as const;

const VALID_TYPES: readonly CampaignType[] = [
  'PAY_PER_CUSTOMER', 'MEDIA_EVENT', 'LOYALTY_REWARD'
] as const;

const VALID_SORT_OPTIONS: readonly CampaignFilters['sortBy'][] = [
  'newest', 'oldest', 'most_visits', 'end_date'
] as const;

// Type guard functions
function isCampaignStatus(value: string): value is CampaignStatus {
  return VALID_STATUSES.includes(value as CampaignStatus);
}

function isCampaignType(value: string): value is CampaignType {
  return VALID_TYPES.includes(value as CampaignType);
}

function isSortOption(value: string): value is NonNullable<CampaignFilters['sortBy']> {
  return VALID_SORT_OPTIONS.includes(value as any);
}

// Then in your filter logic:
const statusArray = status
  .split(',')
  .filter(isCampaignStatus);

const filters: CampaignFilters = {
  status: statusArray.length > 0 ? statusArray : undefined,
  type: type === 'all' || !isCampaignType(type) ? undefined : type,
  search: search || undefined,
  sortBy: sort && isSortOption(sort) ? sort : undefined,
  page: parseInt(page) || 1,
  limit: parseInt(limit) || 10,
};
```

---

### File: `/app/(app)/campaigns/[id]/edit/page.tsx` & `/app/(app)/campaigns/[id]/page.tsx`

#### Fix: Handle params.id properly (Lines 50 and 47 respectively)

**Current:**
```typescript
const campaignId = params.id as string;
```

**Fixed:**
```typescript
// Next.js 14 app router params.id is always a string for dynamic routes
// But for type safety, handle the array case:
const campaignId = Array.isArray(params.id) ? params.id[0] : params.id;
```

---

## Priority 2: Remove Duplicate Type Definitions

### Fix 1: `LoginResponse` & `RegisterResponse`

**File: `/lib/hooks/use-login.ts`**
```typescript
// REMOVE this local definition:
// interface LoginResponse { ... }

// ADD this import:
import type { LoginResponse } from '@/lib/types/auth';
```

**File: `/lib/hooks/use-register.ts`**
```typescript
// REMOVE this local definition:
// interface RegisterResponse { ... }

// ADD this import:
import type { RegisterResponse } from '@/lib/types/auth';
```

---

### Fix 2: `User` & `AuthState`

**File: `/lib/stores/auth-store.ts`**

**Current:**
```typescript
interface User {
  id: string;
  email: string;
  // ... duplicate definition
}

interface AuthState {
  user: User | null;
  // ... duplicate definition
}
```

**Fixed:**
```typescript
import type { User, AuthState as BaseAuthState } from '@/lib/types/auth';

// Extend the base auth state with store methods
interface AuthState extends BaseAuthState {
  // Store-specific methods only
  login: (user: User, token: string, businessId: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setBusinessId: (businessId: string) => void;
}
```

---

### Fix 3: `CampaignFormData`

**File: `/lib/types/campaign.ts`**

**Current:**
```typescript
export interface CampaignFormData {
  type: CampaignType;
  title: string;
  // ... 15 more fields
}
```

**Fixed:**
```typescript
// REMOVE the interface definition entirely

// ADD this re-export:
export type { CampaignFormData } from '@/lib/validation/campaign-schema';
```

**Reason:** The Zod schema in `campaign-schema.ts` is the source of truth. By exporting the inferred type, we ensure schema and types are always in sync.

---

## Priority 3: Remove Unused Type Definitions

### File: `/lib/constants/colors.ts` (Lines 111-117)

**Remove these 7 lines:**
```typescript
export type ColorName = /* ... */;          // Line 111 - DELETE
export type GrayShade = /* ... */;          // Line 112 - DELETE
export type PinkShade = /* ... */;          // Line 113 - DELETE
export type BlueShade = /* ... */;          // Line 114 - DELETE
export type AmberShade = /* ... */;         // Line 115 - DELETE
export type GreenShade = /* ... */;         // Line 116 - DELETE
export type RedShade = /* ... */;           // Line 117 - DELETE
```

---

### File: `/lib/constants/index.ts` (Line 37)

**Remove this line:**
```typescript
export type DesignSystem = /* ... */;       // Line 37 - DELETE
```

---

### File: `/lib/constants/spacing.ts` (Lines 99-105)

**Remove these 6 lines:**
```typescript
export type BorderRadius = /* ... */;               // Line 99  - DELETE
export type BoxShadow = /* ... */;                  // Line 100 - DELETE
export type ZIndex = /* ... */;                     // Line 102 - DELETE
export type TransitionDuration = /* ... */;         // Line 103 - DELETE
export type TransitionTimingFunction = /* ... */;   // Line 104 - DELETE
export type BorderWidth = /* ... */;                // Line 105 - DELETE
```

---

### File: `/lib/constants/typography.ts` (Lines 75-80)

**Remove these 4 lines:**
```typescript
export type FontWeight = /* ... */;         // Line 75 - DELETE
export type LineHeight = /* ... */;         // Line 76 - DELETE
export type LetterSpacing = /* ... */;      // Line 77 - DELETE
export type FontSizeConfig = /* ... */;     // Line 80 - DELETE
```

---

### File: `/lib/types/auth.ts` (Lines 16-83)

**Option A: Remove unused types (Recommended)**
```typescript
// DELETE these interfaces (8 total):
export interface LoginRequest { /* ... */ }            // Line 16 - DELETE
export interface RegisterRequest { /* ... */ }         // Line 22 - DELETE
export interface RefreshTokenRequest { /* ... */ }     // Line 31 - DELETE
export interface ForgotPasswordRequest { /* ... */ }   // Line 35 - DELETE
export interface ResetPasswordRequest { /* ... */ }    // Line 39 - DELETE
export interface RefreshTokenResponse { /* ... */ }    // Line 60 - DELETE
export interface AuthError { /* ... */ }               // Line 67 - DELETE
export interface TokenPayload { /* ... */ }            // Line 76 - DELETE
```

**Option B: Keep and use in hooks**

If you want to keep these types, update the hooks to use them:

```typescript
// In use-login.ts
import type { LoginRequest } from '@/lib/types/auth';

// Create Zod schema from the interface
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
}) satisfies z.ZodType<LoginRequest>;
```

---

### File: `/lib/types/profile.ts` (Lines 88, 222, 294, 302)

**Remove these 4 items:**
```typescript
export interface RemoveTeamMemberRequest { /* ... */ }  // Line 88  - DELETE
export type BusinessType = /* ... */;                   // Line 222 - DELETE
export const PERMISSION_DISPLAY_NAMES = /* ... */;      // Line 294 - DELETE
export const PERMISSION_DESCRIPTIONS = /* ... */;       // Line 302 - DELETE
```

---

### File: `/lib/validation/campaign-schema.ts` (Lines 153-156)

**Decision needed:**

**Option A: Remove (if not used):**
```typescript
// DELETE these 4 lines
export type CampaignTypeFormData = /* ... */;       // Line 153 - DELETE
export type BasicInfoFormData = /* ... */;          // Line 154 - DELETE
export type CampaignDetailsFormData = /* ... */;    // Line 155 - DELETE
export type ReviewFormData = /* ... */;             // Line 156 - DELETE
```

**Option B: Use in components (if you want step-specific types):**
```typescript
// In campaign-type-step.tsx
import type { CampaignTypeFormData } from '@/lib/validation/campaign-schema';

interface CampaignTypeStepProps {
  onNext: (data: CampaignTypeFormData) => void;
  //             ^ Use the exported type
}
```

---

### File: `/lib/validation/profile-schema.ts` (Lines 64, 145, 162)

**Remove these 3 lines:**
```typescript
export type UpdateTeamMemberFormData = /* ... */;       // Line 64  - DELETE
export type AutoRechargeSettingsFormData = /* ... */;   // Line 145 - DELETE
export type TaxInformationFormData = /* ... */;         // Line 162 - DELETE
```

---

## Priority 4: Enable Stricter TypeScript Options

### File: `/tsconfig.json`

**Current:**
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false,
  }
}
```

**Updated:**
```json
{
  "compilerOptions": {
    // Enable to catch unused variables
    "noUnusedLocals": true,

    // Enable to catch unused function parameters
    "noUnusedParameters": true,

    // Additional recommended strict options
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
  }
}
```

**Note:** After enabling these, you'll need to fix any new errors. Run:
```bash
npx tsc --noEmit
```

---

## Verification Commands

After making changes, run these commands to verify:

```bash
# 1. Type check
npm run type-check

# 2. Run the dead code analyzer again
npx tsx analyze-types.ts

# 3. Build to ensure no runtime issues
npm run build

# 4. Run linter
npm run lint
```

---

## Summary of Files to Modify

| File | Action | Lines |
|------|--------|-------|
| `/lib/constants/colors.ts` | Delete unused types | 111-117 |
| `/lib/constants/index.ts` | Delete unused type | 37 |
| `/lib/constants/spacing.ts` | Delete unused types | 99-105 |
| `/lib/constants/typography.ts` | Delete unused types | 75-80 |
| `/lib/types/auth.ts` | Delete or integrate unused types | 16-83 |
| `/lib/types/profile.ts` | Delete unused types | 88, 222, 294, 302 |
| `/lib/types/campaign.ts` | Update interface, re-export type | 43-64, add import |
| `/lib/validation/campaign-schema.ts` | Keep or remove step types | 153-156 |
| `/lib/validation/profile-schema.ts` | Delete unused types | 64, 145, 162 |
| `/lib/hooks/use-login.ts` | Import type instead of defining | Remove interface |
| `/lib/hooks/use-register.ts` | Import type instead of defining | Remove interface |
| `/lib/stores/auth-store.ts` | Import and extend base types | Remove duplicates |
| `/app/api/stripe/webhook/route.ts` | Fix type assertions | 78, 230, 236, 242, 248 |
| `/components/campaigns/detail/overview-tab.tsx` | Remove `as any` | 34 |
| `/components/campaigns/campaign-filters.tsx` | Add type guards | 54, 62, 79 |
| `/app/(app)/campaigns/[id]/edit/page.tsx` | Handle params properly | 50 |
| `/app/(app)/campaigns/[id]/page.tsx` | Handle params properly | 47 |
| `/tsconfig.json` | Enable strict options | Add 4 options |

---

## Estimated Time

- **Priority 1 (Unsafe assertions):** 30-45 minutes
- **Priority 2 (Duplicates):** 15-20 minutes
- **Priority 3 (Unused types):** 20-30 minutes
- **Priority 4 (tsconfig):** 15-20 minutes + fixing new errors

**Total:** ~2-3 hours

---

## Success Criteria

After implementing all fixes:
- ✅ All type assertions justified with comments or replaced with type guards
- ✅ No duplicate type definitions
- ✅ Zero unused type definitions (per analyzer)
- ✅ `noUnusedLocals` and `noUnusedParameters` enabled
- ✅ `npm run build` succeeds
- ✅ Type safety score: 100/100

---

**Generated:** 2025-10-23
**Based on:** TYPESCRIPT_DEAD_CODE_ANALYSIS.md
