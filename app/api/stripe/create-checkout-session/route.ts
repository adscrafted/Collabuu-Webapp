/**
 * API Route: Create Stripe Checkout Session
 * POST /api/stripe/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { calculateCreditPricing } from '@/lib/stripe/config';

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    // Reset or create new limit
    rateLimitMap.set(userId, {
      count: 1,
      resetAt: now + 60000, // 1 minute window
    });
    return true;
  }

  if (userLimit.count >= 5) {
    // Max 5 requests per minute
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { credits, amount, userId, businessId, userEmail } = body;

    // Validate required fields
    if (!credits || !amount || !userId || !businessId || !userEmail) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'credits, amount, userId, businessId, and userEmail are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate credits range
    if (credits < 100 || credits > 100000) {
      return NextResponse.json(
        { error: 'Invalid credit amount', details: 'Credits must be between 100 and 100,000' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many checkout requests. Please try again in a minute.',
        },
        { status: 429 }
      );
    }

    // Calculate server-side pricing to prevent tampering
    const pricing = calculateCreditPricing(credits);

    // Validate that the client-provided amount matches server calculation
    // Allow for small floating point differences (within $0.01)
    if (Math.abs(amount - pricing.price) > 0.01) {
      return NextResponse.json(
        {
          error: 'Price mismatch',
          details: 'The provided amount does not match the calculated price',
          expected: pricing.price,
          received: amount
        },
        { status: 400 }
      );
    }

    // Get origin from request headers for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create checkout session with validated pricing
    const session = await createCheckoutSession({
      packageId: `custom_${credits}credits`,
      credits: pricing.credits,
      price: pricing.price,
      userId,
      businessId,
      userEmail,
      origin,
    });

    // Return session details
    return NextResponse.json(
      {
        sessionId: session.id,
        url: session.url,
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);

    // Check if it's a Stripe error
    if (error instanceof Error) {
      // Log detailed error information
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      return NextResponse.json(
        {
          error: 'Failed to create checkout session',
          message: error.message,
          details: error.name,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An unexpected error occurred',
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
