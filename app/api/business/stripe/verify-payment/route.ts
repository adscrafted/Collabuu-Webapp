/**
 * API Route: Verify Stripe Payment and Add Credits
 * POST /api/business/stripe/verify-payment
 *
 * Called by the Stripe webhook handler to verify payment and add credits to user account.
 * This is a server-to-server API call (not authenticated with JWT).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface VerifyPaymentRequest {
  sessionId: string;
  paymentIntentId: string;
  userId: string;
  businessId: string;
  credits: number;
  packageId: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: VerifyPaymentRequest = await request.json();
    const { sessionId, paymentIntentId, userId, businessId, credits, packageId } = body;

    // Validate required fields
    if (!sessionId || !paymentIntentId || !userId || !businessId || !credits || !packageId) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'sessionId, paymentIntentId, userId, businessId, credits, and packageId are required',
        },
        { status: 400 }
      );
    }

    // Validate credits is a positive number
    if (credits <= 0 || !Number.isInteger(credits)) {
      return NextResponse.json(
        { error: 'Invalid credit amount', details: 'Credits must be a positive integer' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key for admin operations
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
      // Payment already processed - return success to prevent retries
      console.log(`Payment already processed: ${paymentIntentId}`);
      return NextResponse.json(
        {
          success: true,
          message: 'Payment already processed',
          alreadyProcessed: true,
        },
        { status: 200 }
      );
    }

    // Verify the user exists
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', businessId)
      .single();

    if (userError || !user) {
      console.error(`User not found: ${businessId}`);
      return NextResponse.json(
        { error: 'User not found', details: 'Invalid business ID' },
        { status: 404 }
      );
    }

    // Insert credit transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        business_id: businessId,
        transaction_type: 'purchase',
        amount: 0, // For purchases, amount field is not used for balance calculation (credits field is used)
        credits: credits, // CRITICAL: This is the actual number of credits purchased
        description: `Purchased ${credits.toLocaleString()} credits via Stripe`,
        status: 'completed',
        related_table: null,
        related_id: packageId, // Store package ID for reference
        metadata: {
          source: 'stripe',
          packageId: packageId,
          sessionId: sessionId,
          paymentIntentId: paymentIntentId, // Store for idempotency checks
        },
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating credit transaction:', transactionError);
      return NextResponse.json(
        {
          error: 'Failed to add credits',
          details: transactionError.message,
        },
        { status: 500 }
      );
    }

    console.log(`Successfully added ${credits} credits to user ${businessId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Credits added successfully',
        transaction: {
          id: transaction.id,
          credits: transaction.credits,
          businessId: transaction.business_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify payment API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
