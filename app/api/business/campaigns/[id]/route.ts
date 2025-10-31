import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformKeysToCamelCase } from '@/lib/utils';
import { createErrorResponse, ErrorCodes } from '@/lib/utils/api-error';
import {
  validateCampaignType,
  validatePayPerCustomer,
  validateMediaEvent,
  validateLoyaltyReward,
  validateCampaignDates,
  sanitizeString,
  VALIDATION_CONSTRAINTS,
} from '@/lib/utils/campaign-validation';
import { getRateLimitHeaders } from '@/lib/utils/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Platform user ID for direct app attribution (matches iOS implementation)
const PLATFORM_USER_ID = "17b87cb6-9a11-4d50-b742-b1b122cc9f12";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const campaignId = id;

    // First, check if campaign exists at all
    const { data: campaignCheck, error: checkError } = await supabase
      .from('campaigns')
      .select('id, title, business_id')
      .eq('id', campaignId)
      .single();

    // Fetch campaign from Supabase
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('business_id', user.id) // Ensure user owns this campaign
      .single();

    if (campaignError) {
      console.error('Error fetching campaign:', campaignError);

      if (campaignError.code === 'PGRST116') {
        // No rows returned
        return createErrorResponse(
          'Campaign not found',
          404,
          {
            code: ErrorCodes.NOT_FOUND
          }
        );
      }

      return createErrorResponse(
        'Failed to fetch campaign',
        500,
        {
          code: ErrorCodes.DATABASE_ERROR,
          details: campaignError.message
        }
      );
    }

    if (!campaign) {
      return createErrorResponse(
        'Campaign not found',
        404,
        {
          code: ErrorCodes.NOT_FOUND
        }
      );
    }

    // Auto-expire campaign if it has passed its end date
    const now = new Date();
    if (campaign.status === 'active' && campaign.period_end) {
      const endDate = new Date(campaign.period_end);
      if (endDate < now) {
        // Update campaign status to expired in database
        await supabase
          .from('campaigns')
          .update({ status: 'expired' })
          .eq('id', campaignId);

        // Update the local campaign object
        campaign.status = 'expired';
      }
    }

    // Transform snake_case keys to camelCase for frontend
    const transformedCampaign = transformKeysToCamelCase(campaign);

    // Calculate visitor counts from QR code redemptions (matching iOS implementation)
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('qr_code_redemptions')
      .select('customer_id, influencer_id')
      .eq('campaign_id', campaignId)
      .not('customer_id', 'is', null);

    if (redemptionsError) {
      console.error('Error fetching QR redemptions:', redemptionsError);
      // Don't fail, just log the error and continue with empty redemptions
    }

    let influencerVisitorCount = 0;
    let directAppVisitorCount = 0;

    if (redemptions) {
      const influencerCustomers = new Set<string>();
      const directAppCustomers = new Set<string>();

      redemptions.forEach(redemption => {
        if (redemption.customer_id) {
          // Platform user ID and null influencer_id both count as direct app traffic
          if (redemption.influencer_id === PLATFORM_USER_ID || redemption.influencer_id === null) {
            directAppCustomers.add(redemption.customer_id);
          } else if (redemption.influencer_id) {
            influencerCustomers.add(redemption.customer_id);
          }
        }
      });

      influencerVisitorCount = influencerCustomers.size;
      directAppVisitorCount = directAppCustomers.size;
    }

    // Map database fields to frontend Campaign interface
    const mappedCampaign = {
      ...transformedCampaign,
      // Map to frontend flat field structure (supports both webapp and iOS)
      type: transformedCampaign.campaignType || transformedCampaign.paymentType,
      paymentType: transformedCampaign.paymentType || transformedCampaign.campaignType,
      campaignType: transformedCampaign.campaignType || transformedCampaign.paymentType,
      startDate: transformedCampaign.periodStart,
      endDate: transformedCampaign.periodEnd,
      periodStart: transformedCampaign.periodStart,
      periodEnd: transformedCampaign.periodEnd,
      visits: transformedCampaign.visits,
      pendingApplicationsCount: transformedCampaign.pendingApplicationsCount,
      // Flat budget fields (iOS structure)
      totalCredits: transformedCampaign.totalCredits || 0,
      creditsPerCustomer: transformedCampaign.creditsPerCustomer || transformedCampaign.creditsPerAction,
      creditsPerAction: transformedCampaign.creditsPerAction,
      influencerSpots: transformedCampaign.influencerSpots,
      influencerSpotsFilled: transformedCampaign.influencerSpotsFilled || 0,
      rewardValue: transformedCampaign.rewardValue,
      // Nested budget object for backward compatibility (webapp)
      budget: {
        totalCredits: transformedCampaign.totalCredits || 0,
        creditsPerCustomer: transformedCampaign.creditsPerCustomer || transformedCampaign.creditsPerAction,
        creditsPerAction: transformedCampaign.creditsPerAction,
        maxVisits: transformedCampaign.influencerSpots,
        influencerSpots: transformedCampaign.influencerSpots,
        influencerSpotsFilled: transformedCampaign.influencerSpotsFilled || 0,
        rewardValue: transformedCampaign.rewardValue,
      },
      // Visitor attribution (matching iOS implementation)
      visitCount: influencerVisitorCount + directAppVisitorCount,
      influencerVisitorCount,
      directAppVisitorCount,
    };

    return NextResponse.json(mappedCampaign, {
      headers: getRateLimitHeaders()
    });
  } catch (error) {
    console.error('Campaign detail API error:', error);
    return createErrorResponse(
      'Internal server error',
      500,
      {
        code: ErrorCodes.INTERNAL_ERROR,
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const campaignId = id;
    const body = await request.json();

    // Support both flat fields (iOS) and nested budget (webapp)
    const budget = body.budget || {};

    // Extract and normalize campaign type if provided
    const campaignType = body.campaignType || body.paymentType || body.type;

    // Validate campaign type if provided
    if (campaignType !== undefined) {
      const typeError = validateCampaignType(campaignType);
      if (typeError) return typeError;
    }

    // Extract budget fields from flat or nested structure
    const totalCredits = body.totalCredits ?? budget.totalCredits;
    const creditsPerCustomer = body.creditsPerCustomer ?? budget.creditsPerCustomer;
    const creditsPerAction = body.creditsPerAction ?? budget.creditsPerAction;
    const influencerSpots = body.influencerSpots ?? budget.influencerSpots ?? budget.maxVisits;
    const rewardValue = body.rewardValue ?? budget.rewardValue;

    // Type-specific validation (only if campaign type is being updated or all required fields are present)
    if (campaignType === 'pay_per_customer' &&
        (creditsPerCustomer !== undefined || influencerSpots !== undefined || totalCredits !== undefined)) {
      // Only validate if we have enough information
      if (creditsPerCustomer !== undefined && influencerSpots !== undefined && totalCredits !== undefined) {
        const validationError = validatePayPerCustomer({
          creditsPerCustomer,
          influencerSpots,
          totalCredits,
        });
        if (validationError) return validationError;
      }
    }

    if (campaignType === 'media_event' &&
        (totalCredits !== undefined || influencerSpots !== undefined)) {
      // Only validate if we have enough information
      if (totalCredits !== undefined && influencerSpots !== undefined) {
        const validationError = validateMediaEvent({
          totalCredits,
          influencerSpots,
          eventDate: body.eventDate,
        });
        if (validationError) return validationError;
      }
    }

    if (campaignType === 'loyalty_reward' &&
        (totalCredits !== undefined || body.visibility !== undefined || rewardValue !== undefined)) {
      // Only validate if we have enough information
      if (totalCredits !== undefined && body.visibility !== undefined && rewardValue !== undefined) {
        const validationError = validateLoyaltyReward({
          totalCredits,
          visibility: body.visibility,
          rewardValue,
        });
        if (validationError) return validationError;
      }
    }

    // Validate campaign dates if provided
    const periodStart = body.periodStart || body.startDate;
    const periodEnd = body.periodEnd || body.endDate;

    if (periodStart !== undefined && periodEnd !== undefined) {
      const dateError = validateCampaignDates(periodStart, periodEnd);
      if (dateError) return dateError;
    }

    // Check if totalCredits is being increased and validate sufficient credits
    if (totalCredits !== undefined) {
      // Fetch the current campaign to compare credit amounts
      const { data: currentCampaign, error: fetchError } = await supabase
        .from('campaigns')
        .select('total_credits')
        .eq('id', campaignId)
        .eq('business_id', user.id)
        .single();

      if (fetchError || !currentCampaign) {
        return createErrorResponse(
          'Campaign not found',
          404,
          {
            code: ErrorCodes.NOT_FOUND
          }
        );
      }

      const currentTotalCredits = currentCampaign.total_credits || 0;
      const creditDifference = totalCredits - currentTotalCredits;

      // If increasing the budget, check if user has sufficient credits
      if (creditDifference > 0) {
        // Calculate current credit balance (same logic as balance endpoint)
        const allTransactions: any[] = [];

        // 1. Fetch credit additions (purchases)
        const { data: additions } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('business_id', user.id)
          .in('transaction_type', ['purchase'])
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (additions) {
          additions.forEach((addition: any) => {
            allTransactions.push({
              amount: addition.credits ?? addition.amount,
              created_at: addition.created_at,
            });
          });
        }

        // 2. Fetch existing campaigns to calculate deductions
        const { data: existingCampaigns } = await supabase
          .from('campaigns')
          .select('id, total_credits, created_at')
          .eq('business_id', user.id)
          .order('created_at', { ascending: false });

        if (existingCampaigns) {
          for (const campaign of existingCampaigns) {
            if (campaign.total_credits && campaign.total_credits > 0) {
              allTransactions.push({
                amount: -Math.abs(campaign.total_credits),
                created_at: campaign.created_at,
              });
            }
          }
        }

        // 3. Fetch refunds
        const campaignIds = existingCampaigns ? existingCampaigns.map((c: any) => c.id) : [];
        if (campaignIds.length > 0) {
          const { data: refunds } = await supabase
            .from('credit_transactions')
            .select('*')
            .eq('business_id', user.id)
            .eq('transaction_type', 'refund')
            .eq('related_table', 'campaigns')
            .in('related_id', campaignIds)
            .order('created_at', { ascending: false });

          if (refunds) {
            refunds.forEach((refund: any) => {
              allTransactions.push({
                amount: refund.amount,
                created_at: refund.created_at,
              });
            });
          }
        }

        // Calculate current balance
        let currentBalance = 0;
        allTransactions.forEach((transaction) => {
          currentBalance += transaction.amount;
        });

        // Check if sufficient credits for the increase
        if (currentBalance < creditDifference) {
          return createErrorResponse(
            `Insufficient credits to increase campaign budget. You have ${currentBalance} credits available but need ${creditDifference} additional credits.`,
            400,
            {
              code: ErrorCodes.INSUFFICIENT_CREDITS,
              details: JSON.stringify({
                required: creditDifference,
                available: currentBalance,
                shortage: creditDifference - currentBalance,
                currentCampaignBudget: currentTotalCredits,
                newCampaignBudget: totalCredits
              })
            }
          );
        }

        // Create transaction record for the credit increase
        const { error: transactionError } = await supabase
          .from('credit_transactions')
          .insert({
            business_id: user.id,
            transaction_type: 'campaign_create', // Using campaign_create for budget increases
            amount: -Math.abs(creditDifference),
            description: `Campaign budget increased: ${campaignId}`,
            status: 'completed',
            related_table: 'campaigns',
            related_id: campaignId,
            created_at: new Date().toISOString(),
          });

        if (transactionError) {
          console.error('Error creating transaction record:', transactionError);
          // Don't fail the operation, just log the error
        }
      } else if (creditDifference < 0) {
        // Budget decreased - create refund transaction record
        const { error: refundError } = await supabase
          .from('credit_transactions')
          .insert({
            business_id: user.id,
            transaction_type: 'refund',
            amount: Math.abs(creditDifference), // Positive for refund
            description: `Campaign budget decreased: ${campaignId}`,
            status: 'completed',
            related_table: 'campaigns',
            related_id: campaignId,
            created_at: new Date().toISOString(),
          });

        if (refundError) {
          console.error('Error creating refund transaction record:', refundError);
          // Don't fail the operation, just log the error
        }
      }
    }

    // Build update object with proper field mapping
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that are provided, with sanitization for string inputs
    if (body.title !== undefined) {
      updateData.title = sanitizeString(body.title, VALIDATION_CONSTRAINTS.STRING_LIMITS.title);
    }
    if (body.description !== undefined) {
      updateData.description = sanitizeString(body.description, VALIDATION_CONSTRAINTS.STRING_LIMITS.description);
    }

    if (campaignType !== undefined) {
      updateData.campaign_type = campaignType;
    }

    if (body.status !== undefined) updateData.status = body.status;

    // Support both periodStart/periodEnd and startDate/endDate
    if (periodStart !== undefined) {
      updateData.period_start = periodStart;
    }
    if (periodEnd !== undefined) {
      updateData.period_end = periodEnd;
    }

    // Support flat fields or nested budget
    if (influencerSpots !== undefined) {
      updateData.influencer_spots = influencerSpots;
    }
    if (creditsPerAction !== undefined) {
      updateData.credits_per_action = creditsPerAction;
    }
    if (creditsPerCustomer !== undefined) {
      updateData.credits_per_customer = creditsPerCustomer;
    }
    if (totalCredits !== undefined) {
      updateData.total_credits = totalCredits;
    }
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.visibility !== undefined) updateData.visibility = body.visibility;
    if (body.requirements !== undefined) {
      updateData.requirements = sanitizeString(body.requirements, VALIDATION_CONSTRAINTS.STRING_LIMITS.requirements);
    }
    if (body.eventDate !== undefined) updateData.event_date = body.eventDate;

    // Update campaign in Supabase
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .eq('business_id', user.id) // Ensure user owns this campaign
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campaign:', updateError);

      // Check if campaign not found
      if (updateError.code === 'PGRST116') {
        return createErrorResponse(
          'Campaign not found',
          404,
          {
            code: ErrorCodes.NOT_FOUND
          }
        );
      }

      return createErrorResponse(
        'Failed to update campaign',
        500,
        {
          code: ErrorCodes.DATABASE_ERROR,
          details: updateError.message
        }
      );
    }

    if (!campaign) {
      return createErrorResponse(
        'Campaign not found',
        404,
        {
          code: ErrorCodes.NOT_FOUND
        }
      );
    }

    // Transform snake_case keys to camelCase for frontend
    const transformedCampaign = transformKeysToCamelCase(campaign);

    // Map database fields to frontend Campaign interface
    const mappedCampaign = {
      ...transformedCampaign,
      // Map to frontend flat field structure (supports both webapp and iOS)
      type: transformedCampaign.campaignType || transformedCampaign.paymentType,
      paymentType: transformedCampaign.paymentType || transformedCampaign.campaignType,
      campaignType: transformedCampaign.campaignType || transformedCampaign.paymentType,
      startDate: transformedCampaign.periodStart,
      endDate: transformedCampaign.periodEnd,
      periodStart: transformedCampaign.periodStart,
      periodEnd: transformedCampaign.periodEnd,
      visits: transformedCampaign.visits,
      pendingApplicationsCount: transformedCampaign.pendingApplicationsCount,
      // Flat budget fields (iOS structure)
      totalCredits: transformedCampaign.totalCredits || 0,
      creditsPerCustomer: transformedCampaign.creditsPerCustomer || transformedCampaign.creditsPerAction,
      creditsPerAction: transformedCampaign.creditsPerAction,
      influencerSpots: transformedCampaign.influencerSpots,
      influencerSpotsFilled: transformedCampaign.influencerSpotsFilled || 0,
      rewardValue: transformedCampaign.rewardValue,
      // Nested budget object for backward compatibility (webapp)
      budget: {
        totalCredits: transformedCampaign.totalCredits || 0,
        creditsPerCustomer: transformedCampaign.creditsPerCustomer || transformedCampaign.creditsPerAction,
        creditsPerAction: transformedCampaign.creditsPerAction,
        maxVisits: transformedCampaign.influencerSpots,
        influencerSpots: transformedCampaign.influencerSpots,
        influencerSpotsFilled: transformedCampaign.influencerSpotsFilled || 0,
        rewardValue: transformedCampaign.rewardValue,
      },
    };

    return NextResponse.json(mappedCampaign, {
      headers: getRateLimitHeaders()
    });
  } catch (error) {
    console.error('Update campaign API error:', error);
    return createErrorResponse(
      'Internal server error',
      500,
      {
        code: ErrorCodes.INTERNAL_ERROR,
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const campaignId = id;

    // Delete campaign from Supabase
    const { error: deleteError, count } = await supabase
      .from('campaigns')
      .delete({ count: 'exact' })
      .eq('id', campaignId)
      .eq('business_id', user.id); // Ensure user owns this campaign

    if (deleteError) {
      console.error('Error deleting campaign:', deleteError);
      return createErrorResponse(
        'Failed to delete campaign',
        500,
        {
          code: ErrorCodes.DATABASE_ERROR,
          details: deleteError.message
        }
      );
    }

    // Check if campaign was actually deleted (existed and user owned it)
    if (count === 0) {
      return createErrorResponse(
        'Campaign not found',
        404,
        {
          code: ErrorCodes.NOT_FOUND
        }
      );
    }

    return NextResponse.json({ success: true }, {
      headers: getRateLimitHeaders()
    });
  } catch (error) {
    console.error('Delete campaign API error:', error);
    return createErrorResponse(
      'Internal server error',
      500,
      {
        code: ErrorCodes.INTERNAL_ERROR,
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    );
  }
}
