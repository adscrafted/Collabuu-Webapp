# Stripe Integration Setup Guide

This guide walks you through setting up Stripe payment integration for Collabuu's credit purchase system.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Stripe Account](#create-stripe-account)
3. [Create Products and Prices](#create-products-and-prices)
4. [Get API Keys](#get-api-keys)
5. [Configure Webhook](#configure-webhook)
6. [Update Environment Variables](#update-environment-variables)
7. [Test with Stripe CLI](#test-with-stripe-cli)
8. [Move to Production](#move-to-production)
9. [Security Checklist](#security-checklist)

---

## Prerequisites

- Node.js 18+ installed
- Access to deploy the Next.js application
- Admin access to create Stripe account

---

## Create Stripe Account

1. **Sign Up**
   - Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Create a new account or sign in if you already have one
   - Complete business verification (required for production)

2. **Activate Test Mode**
   - In the Stripe Dashboard, ensure you're in **Test Mode** (toggle in top-right)
   - You'll see "Test mode" badge in the navigation

---

## Create Products and Prices

For each credit package, you need to create a Product and Price in Stripe:

### Package 1: 100 Credits - $0.99

1. Go to **Products** → **Add Product**
2. Fill in:
   - **Name**: `100 Credits`
   - **Description**: `Purchase 100 credits for Collabuu campaigns`
   - **Pricing**: One-time payment
   - **Price**: `$0.99`
   - **Currency**: `USD`
3. Click **Add Product**
4. Copy the **Price ID** (starts with `price_`)
5. Update `/lib/stripe/config.ts` - add the price ID to the 100credits package

### Package 2: 500 Credits - $4.49

1. Repeat steps above with:
   - **Name**: `500 Credits`
   - **Price**: `$4.49`
2. Copy the Price ID and update config

### Package 3: 1000 Credits - $7.99

1. Repeat steps above with:
   - **Name**: `1000 Credits`
   - **Price**: `$7.99`
2. Copy the Price ID and update config

### Package 4: 2500 Credits - $18.75

1. Repeat steps above with:
   - **Name**: `2500 Credits`
   - **Price**: `$18.75`
2. Copy the Price ID and update config

### Package 5: 5000 Credits - $37.50

1. Repeat steps above with:
   - **Name**: `5000 Credits`
   - **Price**: `$37.50`
2. Copy the Price ID and update config

**Example config update:**

```typescript
{
  id: '100credits',
  productId: '100credits',
  credits: 100,
  price: 0.99,
  priceId: 'price_1234567890abcdef', // Add this
  displayPrice: '$0.99',
  perCreditPrice: 0.0099,
}
```

---

## Get API Keys

### Publishable Key (Frontend)

1. Go to **Developers** → **API Keys**
2. Copy the **Publishable key** (starts with `pk_test_`)
3. This will be used in `.env.local` as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Secret Key (Backend)

1. In the same page, copy the **Secret key** (starts with `sk_test_`)
2. **⚠️ NEVER commit this to Git or expose it publicly**
3. This will be used in `.env.local` as `STRIPE_SECRET_KEY`

---

## Configure Webhook

Webhooks allow Stripe to notify your app when payments succeed or fail.

### Local Development (Using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Or download from: https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook secret** (starts with `whsec_`)
5. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Production Deployment

1. **Deploy your Next.js app** to production
2. Go to **Developers** → **Webhooks** in Stripe Dashboard
3. Click **Add Endpoint**
4. Enter your endpoint URL:
   ```
   https://your-domain.com/api/stripe/webhook
   ```

5. **Select events to listen to**:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`

6. Click **Add endpoint**
7. Click **Reveal** under **Signing secret** and copy it
8. Add to production environment variables as `STRIPE_WEBHOOK_SECRET`

---

## Update Environment Variables

### Frontend (Next.js) - `.env.local`

Create or update `/Users/anthony/Documents/Projects/Collabuu-Webapp/.env.local`:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Optional: App URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (Node.js) - `/Users/anthony/Documents/Projects/Collabuu/.env`

Add to your Node.js backend:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**⚠️ Security Notes:**
- Never commit `.env` files to Git
- Add `.env.local` to `.gitignore`
- Use different keys for test and production
- Rotate keys if they're ever exposed

---

## Test with Stripe CLI

### 1. Start your Next.js app

```bash
cd /Users/anthony/Documents/Projects/Collabuu-Webapp
npm run dev
```

### 2. Start webhook forwarding

In a separate terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Test a payment

1. Go to `http://localhost:3000/dashboard/credits`
2. Click "Buy Now" on any package
3. Use test card: `4242 4242 4242 4242`
4. Any future expiry date (e.g., 12/34)
5. Any 3-digit CVC
6. Complete checkout

### 4. Verify webhook

Check the Stripe CLI terminal - you should see:
```
✔ Received event checkout.session.completed
```

Check your app logs - you should see payment processing messages.

### Test Cards

| Card Number          | Scenario                  |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | Successful payment        |
| 4000 0000 0000 0002 | Declined payment          |
| 4000 0000 0000 9995 | Insufficient funds        |
| 4000 0025 0000 3155 | Authentication required   |

Full list: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Move to Production

### 1. Complete Stripe Account Activation

1. Go to **Settings** → **Account Details**
2. Complete all required business information
3. Verify your business
4. Add bank account for payouts

### 2. Switch to Live Mode

1. Toggle **Test mode** OFF in Stripe Dashboard
2. Get new API keys from **Developers** → **API Keys**:
   - Live Publishable Key: `pk_live_...`
   - Live Secret Key: `sk_live_...`

### 3. Create Live Products

Repeat the [Create Products and Prices](#create-products-and-prices) steps in Live Mode.

### 4. Create Live Webhook

1. Go to **Developers** → **Webhooks**
2. Add endpoint for production URL
3. Get new webhook secret: `whsec_...`

### 5. Update Production Environment Variables

Update your production environment (Vercel, Railway, etc.) with live keys:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

### 6. Test Production Checkout

1. Make a small real purchase (e.g., 100 credits for $0.99)
2. Verify credits are added to account
3. Check webhook logs in Stripe Dashboard
4. Verify email confirmation (if implemented)

---

## Security Checklist

### Payment Security

- ✅ Never log credit card details
- ✅ Never store card data in your database
- ✅ Always verify webhook signatures
- ✅ Use HTTPS in production
- ✅ Implement rate limiting on checkout endpoint
- ✅ Validate all inputs server-side

### API Key Security

- ✅ Store keys in environment variables
- ✅ Never commit keys to Git
- ✅ Use different keys for test/production
- ✅ Rotate keys if exposed
- ✅ Restrict API key permissions (if possible)

### PCI Compliance

- ✅ Use Stripe.js (not direct API calls) for card collection
- ✅ Never handle raw card data
- ✅ Use Stripe Checkout or Elements
- ✅ Keep Stripe.js and SDK updated

### Idempotency

- ✅ Check for duplicate payments using `paymentIntentId`
- ✅ Use metadata to track processed transactions
- ✅ Handle webhook retries gracefully

### Error Handling

- ✅ Log all errors securely (no sensitive data)
- ✅ Return user-friendly error messages
- ✅ Monitor failed payments
- ✅ Set up alerts for webhook failures

---

## Backend API Implementation

You need to add these endpoints to your Node.js backend at `/Users/anthony/Documents/Projects/Collabuu/`:

### POST /api/business/stripe/verify-payment

```typescript
// src/routes/business.ts

router.post('/stripe/verify-payment', async (req, res) => {
  try {
    const { sessionId, paymentIntentId, userId, businessId, credits, packageId } = req.body;

    // Validate inputs
    if (!sessionId || !paymentIntentId || !userId || !businessId || !credits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if payment already processed (idempotency)
    const existingTransaction = await db.transaction.findOne({
      where: { paymentIntentId }
    });

    if (existingTransaction) {
      return res.json({
        success: true,
        message: 'Payment already processed',
        newBalance: existingTransaction.balanceAfter,
        alreadyProcessed: true,
      });
    }

    // Verify with Stripe (optional but recommended)
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Add credits to business account
    const business = await db.business.findByPk(businessId);
    const previousBalance = business.credits || 0;
    business.credits = previousBalance + credits;
    await business.save();

    // Create transaction record
    await db.transaction.create({
      businessId,
      userId,
      type: 'purchase',
      amount: credits,
      paymentMethod: 'stripe',
      status: 'completed',
      description: `Purchased ${credits} credits`,
      metadata: {
        packageId,
        sessionId,
        paymentIntentId,
      },
      receiptUrl: session.charges?.data[0]?.receipt_url,
    });

    res.json({
      success: true,
      newBalance: business.credits,
      creditsAdded: credits,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});
```

### GET /api/business/:businessId/credits

```typescript
router.get('/:businessId/credits', async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await db.business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    res.json({
      credits: business.credits || 0,
      businessId: business.id,
      lastUpdated: business.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching credits:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
});
```

### GET /api/business/:businessId/transactions

```typescript
router.get('/:businessId/transactions', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, pageSize = 10, type, status } = req.query;

    const where: any = { businessId };
    if (type) where.type = type;
    if (status) where.status = status;

    const transactions = await db.transaction.findAndCountAll({
      where,
      limit: parseInt(pageSize as string),
      offset: (parseInt(page as string) - 1) * parseInt(pageSize as string),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      transactions: transactions.rows,
      total: transactions.count,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string),
      hasMore: transactions.count > parseInt(page as string) * parseInt(pageSize as string),
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
```

---

## Troubleshooting

### Webhook not receiving events

- Verify webhook URL is correct and publicly accessible
- Check Stripe CLI is running for local development
- Verify webhook secret matches environment variable
- Check webhook signature verification code

### Payment succeeds but credits not added

- Check backend API logs for errors
- Verify webhook is hitting the correct endpoint
- Check database permissions
- Verify `paymentIntentId` deduplication logic

### Checkout session creation fails

- Verify API keys are correct
- Check rate limiting
- Verify user authentication
- Check network connectivity to Stripe

### Environment variables not loading

- Restart Next.js dev server after changing `.env.local`
- Verify variable names match exactly (including prefix)
- Check `.env.local` is in the root directory

---

## Support

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Testing Guide**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

## Next Steps

1. ✅ Complete this setup guide
2. 🔄 Replace mock user data in `/app/(dashboard)/credits/page.tsx` with real auth
3. 🔄 Implement backend API endpoints
4. 🔄 Set up email confirmations (optional)
5. 🔄 Add transaction receipt downloads
6. 🔄 Implement refund handling
7. 🔄 Monitor payment analytics
8. 🔄 Set up alerting for failed payments

---

**Last Updated**: October 2025
