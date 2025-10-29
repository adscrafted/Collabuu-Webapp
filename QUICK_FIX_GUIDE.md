# QUICK FIX GUIDE - Credit Purchase System

## The Problem
💰 **Stripe payment succeeds but credits not added to account**

## Root Cause
❌ **Missing backend API URL** in environment configuration

## The Fix (5 Minutes)

### Step 1: Set Backend API URL

Edit `/Users/tonynham/Desktop/APPS/Collabuu-Webapp/.env.local`

**Change this:**
```bash
NEXT_PUBLIC_API_URL=
```

**To this (choose one):**

**Production (Railway):**
```bash
NEXT_PUBLIC_API_URL=https://collabuu-production.up.railway.app
```

**OR Local Development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Step 2: Restart Server

```bash
# Kill the dev server (Ctrl+C)
npm run dev
```

### Step 3: Test It

```bash
# Run diagnostic
npx ts-node scripts/diagnose-credit-system.ts

# Should show all green checkmarks ✅
```

### Step 4: Test Purchase

1. Login → Profile → Billing
2. Select credits → Purchase
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. **Credits should appear immediately** ✅

---

## Still Broken? Check These:

### For Local Testing:
```bash
# Need Stripe CLI running
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Copy the webhook secret and add to .env.local:
STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
```

### Verify Backend is Running:
```bash
# Test if backend is reachable
curl https://collabuu-production.up.railway.app/health
# Should get response (not connection refused)
```

### Check Backend Has Endpoint:
Your backend needs:
```
POST /api/business/stripe/verify-payment
```

---

## Files Changed

✅ **Fixed:**
- `lib/hooks/use-credit-balance.ts` - Better error messages
- `app/api/stripe/webhook/route.ts` - Better logging

📄 **Created:**
- `DEBUGGING_SUMMARY.md` - Complete analysis
- `CREDIT_PURCHASE_FIX.md` - Detailed guide
- `lib/config/validate-env.ts` - Validation utilities
- `scripts/diagnose-credit-system.ts` - Diagnostic tool

---

## What Was Broken

```
User pays → Stripe succeeds → Webhook fires → ❌ Goes to localhost:8080
                                            → ❌ Backend never reached
                                            → ❌ Credits not added
                                            → ❌ Transaction not saved
```

## What Works Now

```
User pays → Stripe succeeds → Webhook fires → ✅ Goes to correct backend URL
                                            → ✅ Backend verifies payment
                                            → ✅ Credits added
                                            → ✅ Transaction saved
                                            → ✅ Balance updates
```

---

## Need More Help?

Read the detailed guides:
1. `DEBUGGING_SUMMARY.md` - Complete root cause analysis
2. `CREDIT_PURCHASE_FIX.md` - Step-by-step fix instructions

Or run diagnostics:
```bash
npx ts-node scripts/diagnose-credit-system.ts
```

---

**TL;DR:** Set `NEXT_PUBLIC_API_URL` in `.env.local`, restart server, test purchase. Done. ✅
