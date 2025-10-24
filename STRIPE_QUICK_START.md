# Stripe Integration - Quick Start Guide

Get up and running with Stripe payments in 15 minutes.

## 1. Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login
```

## 2. Get Test API Keys

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Toggle to **Test Mode** (top-right)
3. Go to **Developers** → **API Keys**
4. Copy the keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

## 3. Update Environment Variables

Edit `/Users/anthony/Documents/Projects/Collabuu-Webapp/.env.local`:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE  # Will get this in step 5
```

## 4. Create Products in Stripe

For each package, create a product in Stripe Dashboard:

**Products** → **Add Product**

| Name          | Price  |
|---------------|--------|
| 100 Credits   | $0.99  |
| 500 Credits   | $4.49  |
| 1000 Credits  | $7.99  |
| 2500 Credits  | $18.75 |
| 5000 Credits  | $37.50 |

After creating, copy each **Price ID** (starts with `price_`) and update `/lib/stripe/config.ts`:

```typescript
{
  id: '100credits',
  credits: 100,
  price: 0.99,
  priceId: 'price_YOUR_PRICE_ID_HERE', // Add this line
  // ...
}
```

## 5. Start Webhook Forwarding

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook secret (starts with `whsec_`) and add to `.env.local`.

## 6. Start the App

```bash
npm run dev
```

Visit: [http://localhost:3000/dashboard/credits](http://localhost:3000/dashboard/credits)

## 7. Test a Purchase

1. Click "Buy Now" on any package
2. Use test card: `4242 4242 4242 4242`
3. Expiry: Any future date (e.g., `12/34`)
4. CVC: Any 3 digits (e.g., `123`)
5. Complete checkout

You should see:
- ✅ Webhook received in Stripe CLI
- ✅ Success message on credits page
- ✅ Confetti animation

## Test Cards

| Card                | Result                    |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | Success                   |
| 4000 0000 0000 0002 | Declined                  |
| 4000 0000 0000 9995 | Insufficient funds        |
| 4000 0025 0000 3155 | Requires authentication   |

## Troubleshooting

### "Stripe publishable key is not configured"
- Check `.env.local` has the correct key name: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart dev server after changing `.env.local`

### "Webhook signature verification failed"
- Make sure Stripe CLI is running
- Check `STRIPE_WEBHOOK_SECRET` matches the CLI output
- Restart dev server

### "Failed to create checkout session"
- Verify `STRIPE_SECRET_KEY` is correct
- Check the secret key starts with `sk_test_` (not `pk_test_`)

### Credits not added after payment
- Check Stripe CLI shows webhook received
- Verify backend API endpoint exists
- Check backend API URL in `.env.local`

## Next Steps

1. ✅ Test purchases work locally
2. 🔄 Implement backend API endpoints (see STRIPE_SETUP.md)
3. 🔄 Replace mock user data with real auth
4. 🔄 Deploy to production
5. 🔄 Switch to live Stripe keys

## Full Documentation

- **Setup Guide**: `STRIPE_SETUP.md`
- **Integration Summary**: `STRIPE_INTEGRATION_SUMMARY.md`
- **Stripe Docs**: https://stripe.com/docs
