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
import { createClient } from '@supabase/supabase-js';

// Disable body parsing for webhook signature verification
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Add credits directly to database
 */
async function addCreditsToDatabase(
  sessionId: string,
  paymentIntentId: string,
  metadata: Stripe.Metadata,
  amountInCents: number
) {
  const { userId, businessId, packageId, credits } = metadata;

  console.log('Adding credits to database:', {
    businessId,
    credits,
    amountInCents,
    paymentIntentId,
  });

  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check for duplicate payment using metadata->paymentIntentId (idempotency)
  const { data: existingTransactions } = await supabase
    .from('credit_transactions')
    .select('id, metadata')
    .eq('business_id', businessId)
    .eq('transaction_type', 'purchase');

  // Check if any transaction has this payment_intent_id in metadata
  const duplicate = existingTransactions?.find(
    (txn: any) => txn.metadata?.paymentIntentId === paymentIntentId
  );

  if (duplicate) {
    console.log('Payment already processed:', paymentIntentId);
    return {
      success: true,
      message: 'Payment already processed',
      alreadyProcessed: true,
    };
  }

  // Insert credit transaction record
  const { data: transaction, error: transactionError } = await supabase
    .from('credit_transactions')
    .insert({
      business_id: businessId,
      transaction_type: 'purchase',
      amount: amountInCents / 100, // Convert cents to dollars (e.g., 57850 cents = $578.50)
      credits: parseInt(credits), // CRITICAL: This is the actual number of credits purchased
      description: `Purchased ${parseInt(credits).toLocaleString()} credits via Stripe`,
      status: 'completed',
      related_table: null,
      related_id: null, // Custom packages don't have UUIDs; store packageId in metadata instead
      metadata: {
        source: 'stripe',
        packageId: packageId,
        sessionId: sessionId,
        paymentIntentId: paymentIntentId,
      },
    })
    .select()
    .single();

  if (transactionError) {
    console.error('Error creating credit transaction:', transactionError);
    throw new Error('Failed to add credits: ' + transactionError.message);
  }

  console.log(`Successfully added ${credits} credits to user ${businessId}`);

  return {
    success: true,
    message: 'Credits added successfully',
    transaction: {
      id: transaction.id,
      credits: transaction.credits,
    },
  };
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

  // Extract metadata
  const metadata = session.metadata;

  if (!metadata) {
    throw new Error('Missing metadata in checkout session');
  }

  const { userId, businessId, packageId, credits } = metadata;

  if (!userId || !businessId || !packageId || !credits) {
    throw new Error('Incomplete metadata in checkout session');
  }

  console.log('Processing payment for user:', businessId);

  // Get the amount paid in cents from Stripe
  const amountInCents = session.amount_total || 0;

  // Add credits directly to database
  const result = await addCreditsToDatabase(
    session.id,
    paymentIntentId,
    metadata,
    amountInCents
  );

  // Send confirmation email
  if (session.customer_email) {
    await sendConfirmationEmail(
      session.customer_email,
      parseInt(credits),
      // STRIPE PAYMENT AMOUNT: Convert cents to dollars for email display
      session.amount_total ? session.amount_total / 100 : 0
    );
  }

  console.log('Payment processed successfully');

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

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 200 });
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
