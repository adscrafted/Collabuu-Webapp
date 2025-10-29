# Critical Fix: Credit Purchase System

## Issue Summary
Payment succeeds in Stripe, but credits are not added to user accounts due to missing backend API URL configuration.

## Root Causes

### 1. Missing Backend API URL (CRITICAL)
**File:** `.env.local`
**Problem:** `NEXT_PUBLIC_API_URL=` (empty)
**Impact:**
- Frontend cannot communicate with backend
- Webhook cannot verify payments with backend
- Credit balance queries fail
- Transaction history unavailable

### 2. Token Error Message
**File:** `lib/hooks/use-credit-balance.ts:28`
**Problem:** Misleading error message "Authentication token required"
**Actual Cause:** Backend API URL not configured, so requests fail before authentication

### 3. Webhook Fallback Issue
**File:** `app/api/stripe/webhook/route.ts:28`
**Problem:** Falls back to `http://localhost:8080` when `NEXT_PUBLIC_API_URL` is empty
**Impact:** Webhook tries to reach wrong backend URL, payment verification fails

## Fixes Applied

### Fix 1: Enhanced Error Handling in Credit Balance Hook
**File:** `lib/hooks/use-credit-balance.ts`
**Changes:**
- Added check for missing `NEXT_PUBLIC_API_URL`
- Improved error messages for connection issues
- Better user-facing error descriptions

### Fix 2: Enhanced Webhook Logging
**File:** `app/api/stripe/webhook/route.ts`
**Changes:**
- Added detailed logging for payment verification
- Added warning when `NEXT_PUBLIC_API_URL` is not configured
- Enhanced error reporting for connection failures

### Fix 3: Configuration Documentation
**This file**

## Required Actions

### Step 1: Configure Backend API URL

You need to determine where your backend is running and update `.env.local`:

#### Option A: Production Backend (Railway)
If your backend is deployed on Railway:

```bash
# In .env.local
NEXT_PUBLIC_API_URL=https://collabuu-production.up.railway.app
```

#### Option B: Local Development
If running backend locally:

```bash
# In .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**How to verify which URL to use:**
1. Check Railway dashboard for your backend deployment URL
2. Or check where your backend API is currently running
3. Test the URL by visiting `{URL}/health` or similar health check endpoint

### Step 2: Restart Development Server

After updating `.env.local`:

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 3: Configure Stripe Webhook for Local Testing

For local development, you need Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI (if not already installed)
# macOS:
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

**Copy the webhook secret from CLI output** (starts with `whsec_`) and update `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_from_cli
```

### Step 4: Configure Webhook for Production

In Stripe Dashboard:
1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://your-domain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy the webhook signing secret
6. Add to your production environment variables:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
```

## Testing the Fix

### Test 1: Verify Backend Connection

```bash
# Check if API URL is configured
echo $NEXT_PUBLIC_API_URL

# Or in browser console on your app:
console.log(process.env.NEXT_PUBLIC_API_URL)
```

### Test 2: Test Credit Balance Query

1. Log in to your app
2. Navigate to Profile → Billing tab
3. Check browser console for errors
4. You should see your credit balance (or 0 if no credits)

### Test 3: Test Credit Purchase (Local)

**Prerequisites:**
- Backend running
- Stripe CLI forwarding webhooks
- `NEXT_PUBLIC_API_URL` configured

**Steps:**
1. Go to Profile → Billing
2. Select credit amount
3. Click "Purchase Credits"
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete checkout
6. **Watch Stripe CLI terminal** - you should see:
   - `checkout.session.completed` event
   - Webhook forwarded to local server
   - Status 200 response
7. Check browser - credit balance should update
8. Check backend logs - payment verification should succeed

### Test 4: Test Failed Payment Handling

1. Use declining test card: `4000 0000 0000 0002`
2. Complete checkout (will fail)
3. Verify no credits added
4. Check webhook logs

## Monitoring & Debugging

### Check Webhook Delivery (Stripe Dashboard)

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View recent deliveries
4. Check for failed deliveries (status not 200)
5. Inspect request/response for each delivery

### Server Logs to Monitor

When a purchase is made, you should see these logs in sequence:

```
1. Stripe webhook event: checkout.session.completed
2. Processing payment: { sessionId, paymentIntentId, userId, credits }
3. Verifying payment with backend: { backendUrl, sessionId }
4. Backend verification successful: { ... }
5. Payment processed successfully: { ... }
```

**Red flags:**
- "CRITICAL: NEXT_PUBLIC_API_URL is not configured"
- "CRITICAL: Cannot connect to backend at: http://localhost:8080"
- "Error verifying payment with backend"
- Webhook returns status 500

### User-Facing Error Messages

After the fix, users will see clearer errors:

- Before: "Authentication token required" (confusing)
- After: "Unable to connect to server. Please check your connection and try again." (connection issue)
- After: "API configuration error. Please contact support." (missing backend URL)

## Backend Requirements

Your backend MUST have this endpoint:

```
POST /api/business/stripe/verify-payment
```

**Request Body:**
```json
{
  "sessionId": "cs_test_...",
  "paymentIntentId": "pi_...",
  "userId": "user-uuid",
  "businessId": "business-uuid",
  "credits": 1000,
  "packageId": "custom_1000credits"
}
```

**Expected Response:**
```json
{
  "success": true,
  "credits": 1000,
  "newBalance": 1000,
  "transactionId": "txn-uuid"
}
```

The backend should:
1. Verify the payment with Stripe API
2. Check payment hasn't been processed already
3. Add credits to user's account
4. Create transaction record
5. Return updated balance

## Verification Checklist

- [ ] `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Dev server restarted after env change
- [ ] Can view credit balance in Billing tab (no errors)
- [ ] Stripe CLI running for local testing (if local)
- [ ] Backend `/api/business/stripe/verify-payment` endpoint exists
- [ ] Backend is running and accessible
- [ ] Webhook endpoint configured in Stripe Dashboard (production)
- [ ] Test purchase completes successfully
- [ ] Credits added to account after purchase
- [ ] Transaction appears in history
- [ ] Webhook delivery shows status 200 in Stripe Dashboard

## Support

If issues persist after following this guide:

1. Check server logs during purchase attempt
2. Check Stripe webhook delivery logs
3. Verify backend is receiving the webhook call
4. Check backend logs for verification endpoint
5. Ensure database is updating correctly

## Prevention

To prevent similar issues in the future:

1. Add environment variable validation at startup
2. Create health check endpoint that verifies all external service connections
3. Add monitoring/alerting for webhook failures
4. Implement retry logic for failed webhook deliveries
5. Add end-to-end tests for purchase flow
6. Document all required environment variables

---

**Last Updated:** 2025-10-29
**Applies To:** Collabuu Webapp v1.0
