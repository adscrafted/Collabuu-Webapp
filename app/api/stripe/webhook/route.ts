/**
 * API Route: Stripe Webhook Handler
 * POST /api/stripe/webhook
 *
 * IMPORTANT: This endpoint must have raw body access for signature verification
 * Next.js automatically provides this for webhook routes
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import axios from 'axios';

// Disable body parsing for webhook signature verification
export const dynamic = 'force-dynamic';

// Track processed payment intents to prevent duplicate processing
const processedPayments = new Set<string>();

/**
 * Call backend API to verify payment and add credits
 */
async function verifyPaymentWithBackend(
  sessionId: string,
  paymentIntentId: string,
  metadata: Stripe.Metadata
) {
  // Validate backend URL is configured
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not configured. Cannot verify payment without backend API URL.'
    );
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (process.env.NODE_ENV === 'development') {
    console.log('Verifying payment with backend');
  }

  try {
    const response = await axios.post(
      `${backendUrl}/api/business/stripe/verify-payment`,
      {
        sessionId,
        paymentIntentId,
        userId: metadata.userId,
        businessId: metadata.businessId,
        credits: parseInt(metadata.credits),
        packageId: metadata.packageId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('Backend verification successful');
    }
    return response.data;
  } catch (error) {
    console.error('Error verifying payment with backend');

    if (axios.isAxiosError(error)) {
      console.error('Backend error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        code: error.code,
        message: error.message,
      });

      // Log connection errors separately
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.error('CRITICAL: Cannot connect to backend. Check NEXT_PUBLIC_API_URL configuration');
      }
    }

    throw new Error('Failed to verify payment with backend');
  }
}

/**
 * Send confirmation email
 * Note: Email service integration required (SendGrid, Resend, AWS SES, etc.)
 */
async function sendConfirmationEmail(
  email: string,
  credits: number,
  amount: number
) {
  // Implement your email service integration here
  if (process.env.NODE_ENV === 'development') {
    console.log('Confirmation email queued');
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id;

  if (!paymentIntentId) {
    throw new Error('Missing payment intent ID in checkout session');
  }

  // Check for duplicate processing
  if (processedPayments.has(paymentIntentId)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Payment already processed, skipping');
    }
    return {
      success: true,
      message: 'Payment already processed',
    };
  }

  // Extract metadata
  const metadata = session.metadata;

  if (!metadata) {
    throw new Error('Missing metadata in checkout session');
  }

  const { userId, businessId, packageId, credits } = metadata;

  if (!userId || !businessId || !packageId || !credits) {
    throw new Error('Incomplete metadata in checkout session');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Processing payment');
  }

  // Verify payment with backend and add credits
  const result = await verifyPaymentWithBackend(
    session.id,
    paymentIntentId,
    metadata
  );

  // Mark as processed
  processedPayments.add(paymentIntentId);

  // Send confirmation email
  if (session.customer_email) {
    await sendConfirmationEmail(
      session.customer_email,
      parseInt(credits),
      // STRIPE PAYMENT AMOUNT: Convert cents to dollars for email display
      session.amount_total ? session.amount_total / 100 : 0
    );
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Payment processed successfully');
  }

  return result;
}

/**
 * Handle payment_intent.succeeded event
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent
) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Payment intent succeeded:', {
      status: paymentIntent.status,
    });
  }

  return {
    success: true,
    message: 'Payment intent succeeded',
  };
}

/**
 * Handle payment_intent.payment_failed event
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent
) {
  console.error('Payment intent failed:', {
    status: paymentIntent.status,
    errorCode: paymentIntent.last_payment_error?.code,
  });

  // Note: Implement email notification to user about payment failure

  return {
    success: true,
    message: 'Payment failure logged',
  };
}

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Charge refunded:', {
      refunded: charge.refunded,
    });
  }

  // Note: Implement backend API call to deduct credits from user account on refund

  return {
    success: true,
    message: 'Refund logged',
  };
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body as text for signature verification
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(body, signature);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    // Handle different event types
    let result;

    switch (event.type) {
      case 'checkout.session.completed':
        result = await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'payment_intent.succeeded':
        result = await handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.payment_failed':
        result = await handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'charge.refunded':
        result = await handleChargeRefunded(
          event.data.object as Stripe.Charge
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
        result = {
          success: true,
          message: 'Event received but not handled',
        };
    }

    // Return 200 OK to acknowledge receipt
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);

    // Return 500 to trigger Stripe's retry mechanism
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
