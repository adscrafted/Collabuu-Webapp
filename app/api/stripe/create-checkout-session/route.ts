/**
 * API Route: Create Stripe Checkout Session
 * POST /api/stripe/create-checkout-session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/server';
import { getCreditPackageById } from '@/lib/stripe/config';

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
    const { packageId, userId, businessId, userEmail } = body;

    // Validate required fields
    if (!packageId || !userId || !businessId || !userEmail) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          details: 'packageId, userId, businessId, and userEmail are required',
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

    // Get credit package
    const creditPackage = getCreditPackageById(packageId);

    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Invalid package ID', packageId },
        { status: 400 }
      );
    }

    // Validate credits and price match
    if (body.credits && body.credits !== creditPackage.credits) {
      return NextResponse.json(
        { error: 'Credits mismatch' },
        { status: 400 }
      );
    }

    if (body.price && body.price !== creditPackage.price) {
      return NextResponse.json(
        { error: 'Price mismatch' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      packageId: creditPackage.id,
      credits: creditPackage.credits,
      price: creditPackage.price,
      userId,
      businessId,
      userEmail,
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
      return NextResponse.json(
        {
          error: 'Failed to create checkout session',
          message: error.message,
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
