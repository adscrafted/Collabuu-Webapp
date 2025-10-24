/**
 * Server-side Stripe client
 * Used in API routes and server components only
 */

import Stripe from 'stripe';

// Validate environment variable
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    'STRIPE_SECRET_KEY is not defined in environment variables. Please add it to .env.local'
  );
}

// Initialize Stripe instance (server-side only)
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
  appInfo: {
    name: 'Collabuu',
    version: '1.0.0',
  },
});

/**
 * Create a Stripe Checkout Session
 */
export interface CreateCheckoutSessionParams {
  packageId: string;
  credits: number;
  price: number;
  userId: string;
  businessId: string;
  userEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export async function createCheckoutSession({
  packageId,
  credits,
  price,
  userId,
  businessId,
  userEmail,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${credits} Credits`,
              description: `Purchase ${credits.toLocaleString()} credits for Collabuu campaigns`,
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/credits?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/credits?canceled=true`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        businessId,
        packageId,
        credits: credits.toString(),
        source: 'web',
      },
      // Enable automatic tax calculation (optional)
      // automatic_tax: { enabled: true },

      // Allow promotion codes
      allow_promotion_codes: true,

      // Billing address collection
      billing_address_collection: 'auto',

      // Payment intent data for idempotency
      payment_intent_data: {
        metadata: {
          userId,
          businessId,
          packageId,
          credits: credits.toString(),
        },
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

