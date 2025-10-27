# Stripe Webhook Setup Guide

## The Problem
When you complete a purchase, Stripe needs to notify your app that the payment succeeded so it can credit your account. This happens through webhooks.

**Current Issue:** Credits aren't being added after purchase because:
1. Webhooks don't work in local development without the Stripe CLI
2. Your backend API needs to handle the credit addition

## Solution: Set Up Stripe CLI for Local Testing

### Step 1: Install Stripe CLI

**Mac (using Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows (using Scoop):**
```bash
scoop install stripe
```

**Linux:**
```bash
# Download the latest binary
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz

# Extract and move to PATH
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

### Step 2: Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate.

### Step 3: Forward Webhooks to Your Local Server

**Open a NEW terminal window/tab** and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You should see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Copy the Webhook Secret

Copy the `whsec_xxxxxxxxxxxxx` value and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 5: Restart Your Dev Server

```bash
# Stop your current dev server (Ctrl+C)
npm run dev
```

### Step 6: Test the Purchase Flow

1. Go to the Billing tab
2. Select credits and click "Purchase"
3. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any 5-digit ZIP code
4. Complete the purchase

### Step 7: Monitor Webhook Events

In the terminal where `stripe listen` is running, you should see:
```
2025-01-XX XX:XX:XX   --> checkout.session.completed [evt_xxx]
2025-01-XX XX:XX:XX  <--  [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
```

Your backend logs should show:
```
Received webhook event: checkout.session.completed
Processing payment: { sessionId: ..., credits: 1000, ... }
Payment processed successfully
```

## How It Works

1. **User completes checkout** → Stripe processes payment
2. **Stripe sends webhook** → `localhost:3000/api/stripe/webhook`
3. **Your webhook handler** → Calls your backend API at `/api/business/stripe/verify-payment`
4. **Backend API** → Credits the user's account
5. **User is redirected** → Back to your app with success message

## Production Setup

For production (when deploying to Vercel, Railway, etc.):

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the webhook signing secret
6. Add to your production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
   ```

## Troubleshooting

### Webhook Not Receiving Events
- Make sure `stripe listen` is running in a separate terminal
- Check that your dev server is running on port 3000
- Verify `.env.local` has the correct webhook secret

### Credits Not Being Added
- Check your backend API is running: `NEXT_PUBLIC_API_URL` in `.env.local`
- Look at backend logs for errors in `/api/business/stripe/verify-payment`
- The backend needs to handle adding credits to the database

### Testing Without Backend API (Temporary)
If your backend isn't ready yet, you can modify the webhook to credit locally:

```typescript
// In app/api/stripe/webhook/route.ts
// Comment out the backend API call and add credits directly to Supabase
// (This is just for testing - use the backend API in production)
```

## Common Test Cards

- **Success:** `4242 4242 4242 4242`
- **Requires authentication:** `4000 0027 6000 3184`
- **Declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0000 0000 9995`

More test cards: https://stripe.com/docs/testing

## Next Steps

1. ✅ Install Stripe CLI
2. ✅ Run `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. ✅ Copy webhook secret to `.env.local`
4. ✅ Restart dev server
5. ✅ Test a purchase

Once webhooks are working, credits will be automatically added to your account after each successful purchase!
