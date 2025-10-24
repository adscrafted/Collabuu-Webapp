# Credit Balance Endpoint Mapping

## Summary
Updated the webapp to use the same credit balance endpoint as the iOS app, ensuring both platforms show the same credit data.

## Backend Endpoint (Shared by iOS & Web)

**Endpoint:** `GET /api/business/credits/balance`

**Authentication:** Bearer token (JWT)

**Response:**
```json
{
  "balance": 12345
}
```

**Implementation:** `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/business.ts:5166-5190`

The backend:
- Uses `req.user?.id` from the JWT token (not URL params)
- Fetches from `business_profiles.credits_available` in Supabase
- Returns the balance as a number

## Webapp Changes

### 1. Updated Credit Balance Hook
**File:** `lib/hooks/use-credit-balance.ts`

**Before:**
```typescript
// Wrong endpoint path
const response = await axios.get(`${backendUrl}/api/business/${businessId}/credits`);

// Expected wrong response format
interface CreditBalance {
  credits: number;
  businessId: string;
  lastUpdated: string;
}
```

**After:**
```typescript
// Correct endpoint path matching backend
const response = await axios.get(`${backendUrl}/api/business/credits/balance`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Transforms backend response to match our interface
return {
  credits: response.data.balance,
  lastUpdated: new Date().toISOString(),
};
```

### 2. Updated Components to Use Auth Token

**Files Updated:**
- `components/profile/billing-tab.tsx`
- `components/layout/Sidebar.tsx`
- `app/(app)/credits/page.tsx`

**Before:**
```typescript
const { user } = useAuth();
const businessId = user?.user_metadata?.businessId;
const { data: creditBalance } = useCreditBalance(businessId);
```

**After:**
```typescript
const { user, token } = useAuth();
const { data: creditBalance } = useCreditBalance(token);
```

### 3. BusinessId vs UserId

The backend uses `userId` (from the JWT token) as the `businessId`. Updated all components to use:
```typescript
businessId: userId  // Backend uses userId as businessId
```

## Environment Configuration

Ensure `NEXT_PUBLIC_API_URL` is set to your backend URL:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## How It Works Now

1. **User logs in** → Supabase returns JWT token
2. **Token stored** → `useAuth()` hook stores token in auth store
3. **Credit balance fetched** → `useCreditBalance(token)` calls backend with Bearer token
4. **Backend validates** → Extracts `userId` from JWT, queries database
5. **Response transformed** → Hook converts `balance` to `credits` for display
6. **UI updates** → Both sidebar and billing tab show same credit balance

## Data Flow

```
iOS App & Web App
      ↓
  Same JWT Token
      ↓
GET /api/business/credits/balance
  Authorization: Bearer {token}
      ↓
Backend extracts userId from token
      ↓
Query: business_profiles WHERE user_id = {userId}
      ↓
Response: { balance: 12345 }
      ↓
Both platforms show same credits!
```

## Testing

To verify the integration:

1. Log in on iOS app → Check credit balance
2. Log in on web app with same account → Should show same balance
3. Purchase credits on iOS → Refresh web app → Balance updates
4. Purchase credits on web → Refresh iOS → Balance updates

## Notes

- Credit balance auto-refreshes every 60 seconds on the webapp
- Data is considered fresh for 30 seconds (no refetch during this time)
- Refetches when window gains focus for latest data
- Both platforms use the same Supabase JWT for authentication
