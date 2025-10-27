# Stripe Test Mode Guide

Complete guide for testing Stripe payments locally before going to production.

## Quick Start

Your test mode is already configured! Just follow these steps:

### 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login
```

### 2. Start Webhook Forwarding

Open a **separate terminal window** and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### 3. Update Webhook Secret

Copy the webhook secret from the CLI output and update `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 4. Start Your App

In your main terminal:

```bash
npm run dev
```

### 5. Test a Purchase

1. Visit: `http://localhost:3000/credits`
2. Click "Buy Now" on any package
3. Use test card: **4242 4242 4242 4242**
4. Expiry: Any future date (e.g., `12/34`)
5. CVC: Any 3 digits (e.g., `123`)
6. Complete checkout

You should see:
- ✅ Webhook received in Stripe CLI terminal
- ✅ Success message on credits page
- ✅ Confetti animation (if implemented)

---

## Test Cards

Stripe provides various test cards for different scenarios:

| Card Number          | Scenario                  | Use Case                    |
|---------------------|---------------------------|-----------------------------|
| 4242 4242 4242 4242 | Success                   | Normal successful payment   |
| 4000 0000 0000 0002 | Declined                  | Card declined by issuer     |
| 4000 0000 0000 9995 | Insufficient funds        | Not enough money on card    |
| 4000 0025 0000 3155 | Authentication required   | 3D Secure authentication    |
| 4000 0000 0000 0341 | Attaching fails           | Card can't be attached      |
| 4000 0000 0000 0069 | Charge expires            | Payment expires             |

Full list: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Current Test Mode Setup

### Products Created ✅

All test products are configured in your Stripe account:

| Package       | Credits | Price      | Discount | Price ID                          |
|---------------|---------|------------|----------|-----------------------------------|
| 100 Credits   | 100     | $99.00     | 0%       | `price_1SMbYPQ9ffGKoXMhcaHpsha4` |
| 500 Credits   | 500     | $445.50    | 10%      | `price_1SMbdZQ9ffGKoXMhQ21BA3oA` |
| 1000 Credits  | 1000    | $841.50    | 15%      | `price_1SMbdcQ9ffGKoXMhnVC9FVHD` |
| 2500 Credits  | 2500    | $1,980.00  | 20%      | `price_1SMbgwQ9ffGKoXMhyYsyF1FK` |
| 5000 Credits  | 5000    | $3,712.50  | 25%      | `price_1SMbiIQ9ffGKoXMhEzj5aqHI` |

### API Keys Configured ✅

Your `.env.local` is currently set to **TEST MODE**:
- Publishable Key: `pk_test_51RiQzbQ9ffGKoXMh...`
- Secret Key: `sk_test_51RiQzbQ9ffGKoXMh...`

---

## Switching Between Test and Production

### To Use TEST Mode (Development)

Edit `.env.local`:

```bash
# TEST MODE - Active
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_test_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_cli

# LIVE MODE - Commented out
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Restart your dev server** after changing keys!

### To Use LIVE Mode (Production)

Edit `.env.local`:

```bash
# TEST MODE - Commented out
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
# STRIPE_SECRET_KEY=sk_test_...

# LIVE MODE - Active
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
```

**⚠️ WARNING:** Live mode will charge REAL money!

---

## Automatic Mode Detection

The app automatically detects which mode you're in based on the publishable key:
- Starts with `pk_test_` → Uses test price IDs
- Starts with `pk_live_` → Uses live price IDs

This is configured in `/lib/stripe/config.ts`:

```typescript
.map(pkg => ({
  ...pkg,
  priceId: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_')
    ? pkg.testPriceId
    : pkg.livePriceId
}))
```

---

## Webhook Events

The webhook endpoint listens for these events:

| Event                          | Description                          |
|--------------------------------|--------------------------------------|
| `checkout.session.completed`   | Customer completed checkout          |
| `payment_intent.succeeded`     | Payment successfully processed       |
| `payment_intent.payment_failed`| Payment failed                       |
| `charge.refunded`              | A refund was issued                  |

### Webhook Endpoint

- **Local**: `http://localhost:3000/api/stripe/webhook`
- **Production**: `https://collabuu.com/api/stripe/webhook`

---

## Testing Workflow

### 1. Test Successful Purchase

```bash
# Terminal 1: Start Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 2: Start dev server
npm run dev

# Browser: Go to localhost:3000/credits
# Use test card: 4242 4242 4242 4242
```

Expected result:
- ✅ Checkout completes
- ✅ Webhook event appears in Terminal 1
- ✅ Credits added to account
- ✅ Success page displayed

### 2. Test Failed Payment

Use declined card: `4000 0000 0000 0002`

Expected result:
- ❌ Payment declined
- ❌ Error message shown
- ❌ No credits added

### 3. Test Webhook Handling

Trigger a test webhook manually:

```bash
stripe trigger checkout.session.completed
```

This sends a test event to your webhook endpoint.

---

## Troubleshooting

### Webhook Not Receiving Events

**Problem**: Stripe CLI running but no events received

**Solution**:
1. Verify CLI is forwarding to correct URL
2. Check webhook secret matches in `.env.local`
3. Restart dev server after changing `.env.local`
4. Check logs in Stripe CLI terminal

### "Invalid API Key"

**Problem**: API calls failing with authentication error

**Solution**:
1. Verify you're using matching keys (both test or both live)
2. Check keys are correctly copied (no extra spaces)
3. Restart dev server after changing keys

### Wrong Products Showing

**Problem**: Seeing different prices than expected

**Solution**:
1. Check which mode you're in (test vs live)
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` starts with correct prefix
3. Clear browser cache
4. Check `/lib/stripe/config.ts` has correct price IDs

### Credits Not Added After Payment

**Problem**: Payment succeeds but credits don't appear

**Solution**:
1. Check webhook is receiving events (Stripe CLI log)
2. Verify backend API is running
3. Check webhook handler logs for errors
4. Verify payment intent ID matches in database

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Test all payment flows in test mode
- [ ] Test successful payments
- [ ] Test declined payments
- [ ] Test webhook handling
- [ ] Switch to live API keys in production environment
- [ ] Verify live webhook endpoint is configured: `https://collabuu.com/api/stripe/webhook`
- [ ] Test a small real purchase (e.g., 100 credits)
- [ ] Monitor webhook logs in Stripe Dashboard
- [ ] Set up payment failure alerts
- [ ] Document refund process

---

## Useful Commands

```bash
# Login to Stripe CLI
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger a test webhook event
stripe trigger checkout.session.completed

# View recent events
stripe events list --limit 10

# View recent charges
stripe charges list --limit 10

# View product list
stripe products list

# View prices for a product
stripe prices list --product prod_xxx
```

---

## Resources

- **Stripe Testing Guide**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe CLI Docs**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Test Cards**: [https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)
- **Webhook Events**: [https://stripe.com/docs/api/events](https://stripe.com/docs/api/events)
- **Your Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)

---

**Happy Testing! 🎉**
