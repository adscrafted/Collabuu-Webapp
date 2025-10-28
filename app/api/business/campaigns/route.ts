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
  validateRequiredFields,
  sanitizeString,
  VALIDATION_CONSTRAINTS,
} from '@/lib/utils/campaign-validation';
import { getRateLimitHeaders } from '@/lib/utils/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Platform user ID for direct app attribution (matches iOS implementation)
const PLATFORM_USER_ID = "17b87cb6-9a11-4d50-b742-b1b122cc9f12";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Query campaigns from Supabase
    let query = supabase
      .from('campaigns')
      .select('*')
      .eq('business_id', user.id);

    // Apply status filter
    if (status && status !== 'all') {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    }

    // Execute query
    let { data: campaigns, error: campaignsError } = await query;

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return createErrorResponse(
        'Failed to fetch campaigns',
        500,
        {
          code: ErrorCodes.DATABASE_ERROR,
          details: campaignsError.message
        }
      );
    }

    // Auto-expire campaigns that have passed their end date
    const now = new Date();
    const campaignsToExpire = (campaigns || []).filter((campaign: any) => {
      if (campaign.status === 'active' && campaign.period_end) {
        const endDate = new Date(campaign.period_end);
        return endDate < now;
      }
      return false;
    });

    // Update expired campaigns in the database
    if (campaignsToExpire.length > 0) {
      const campaignIdsToExpire = campaignsToExpire.map((c: any) => c.id);
      await supabase
        .from('campaigns')
        .update({ status: 'expired' })
        .in('id', campaignIdsToExpire);

      // Update the local campaigns array to reflect the change
      campaigns = campaigns?.map((campaign: any) => {
        if (campaignIdsToExpire.includes(campaign.id)) {
          return { ...campaign, status: 'expired' };
        }
        return campaign;
      });
    }

    // Transform snake_case keys to camelCase for frontend
    const transformedCampaigns = transformKeysToCamelCase(campaigns || []);

    // Calculate visitor counts for all campaigns (matching iOS implementation)
    const campaignIds = transformedCampaigns.map((c: any) => c.id);

    // Fetch QR redemptions for all campaigns
    const { data: allRedemptions, error: redemptionsError } = await supabase
      .from('qr_code_redemptions')
      .select('campaign_id, customer_id, influencer_id')
      .in('campaign_id', campaignIds)
      .not('customer_id', 'is', null);

    if (redemptionsError) {
      console.error('Error fetching QR redemptions:', redemptionsError);
      // Don't fail, just log the error and continue with empty redemptions
    }

    // Process redemptions per campaign to calculate visitor attribution
    const visitorCountsMap = new Map();

    campaignIds.forEach((campaignId: string) => {
      const campaignRedemptions = allRedemptions?.filter(r => r.campaign_id === campaignId) || [];
      const influencerCustomers = new Set<string>();
      const directAppCustomers = new Set<string>();

      campaignRedemptions.forEach(redemption => {
        if (redemption.customer_id) {
          // Platform user ID and null influencer_id both count as direct app traffic
          if (redemption.influencer_id === PLATFORM_USER_ID || redemption.influencer_id === null) {
            directAppCustomers.add(redemption.customer_id);
          } else if (redemption.influencer_id) {
            influencerCustomers.add(redemption.customer_id);
          }
        }
      });

      visitorCountsMap.set(campaignId, {
        influencer: influencerCustomers.size,
        directApp: directAppCustomers.size,
        total: influencerCustomers.size + directAppCustomers.size
      });
    });

    // Fetch stats for each campaign
    const campaignsWithStats = await Promise.all(
      transformedCampaigns.map(async (campaign: any) => {
        // Count accepted participants
        const { count: participantsCount, error: participantsError } = await supabase
          .from('campaign_applications')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'accepted');

        if (participantsError) {
          console.error('Error fetching participants for campaign', campaign.id, ':', participantsError);
          // Don't fail, just set to 0
        }

        // Sum credits spent
        const { data: creditsData, error: creditsError } = await supabase
          .from('visits')
          .select('credits_awarded')
          .eq('campaign_id', campaign.id)
          .eq('status', 'verified');

        if (creditsError) {
          console.error('Error fetching credits for campaign', campaign.id, ':', creditsError);
          // Don't fail, just set to 0
        }

        const creditsSpent = creditsData?.reduce((sum, visit) => sum + (visit.credits_awarded || 0), 0) || 0;

        // Count accepted influencers (same as participants for now)
        const acceptedInfluencersCount = participantsCount || 0;

        // Get visitor counts from map (calculated from QR code redemptions)
        const visitorCounts = visitorCountsMap.get(campaign.id) || { influencer: 0, directApp: 0, total: 0 };

        // Count content submissions
        const { count: contentSubmissionsCount, error: contentError } = await supabase
          .from('content_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        if (contentError) {
          console.error('Error fetching content submissions for campaign', campaign.id, ':', contentError);
          // Don't fail, just set to 0
        }

        return {
          ...campaign,
          // iOS-compatible field mapping
          type: campaign.campaignType,
          periodStart: campaign.periodStart,
          periodEnd: campaign.periodEnd,
          visitCount: visitorCounts.total,
          influencerVisitorCount: visitorCounts.influencer,
          directAppVisitorCount: visitorCounts.directApp,
          pendingApplicationsCount: campaign.pendingApplicationsCount,
          // Flat budget fields (iOS structure)
          totalCredits: campaign.totalCredits || 0,
          creditsPerCustomer: campaign.creditsPerCustomer,
          creditsPerAction: campaign.creditsPerAction,
          influencerSpots: campaign.influencerSpots,
          influencerSpotsFilled: campaign.influencerSpotsFilled || 0,
          rewardValue: campaign.rewardValue,
          stats: {
            visitsCount: visitorCounts.total, // Use QR redemptions count, not visits table
            participantsCount: participantsCount || 0,
            creditsSpent,
            acceptedInfluencersCount,
            contentSubmissionsCount: contentSubmissionsCount || 0,
          },
        };
      })
    );

    // Return campaigns array (webapp expects array, not wrapped object)
    return NextResponse.json(campaignsWithStats, {
      headers: getRateLimitHeaders()
    });
  } catch (error) {
    console.error('Campaigns API error:', error);
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

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json();

    // Validate required fields
    const requiredFieldsError = validateRequiredFields(body);
    if (requiredFieldsError) return requiredFieldsError;

    // Support both flat fields (iOS) and nested budget (webapp)
    const budget = body.budget || {};

    // Extract and normalize campaign type
    const campaignType = body.campaignType || body.paymentType || body.type;

    // Validate campaign type
    const typeError = validateCampaignType(campaignType);
    if (typeError) return typeError;

    // Extract budget fields from flat or nested structure
    const totalCredits = body.totalCredits ?? budget.totalCredits ?? 0;
    const creditsPerCustomer = body.creditsPerCustomer ?? budget.creditsPerCustomer;
    const creditsPerAction = body.creditsPerAction ?? budget.creditsPerAction;
    const creditsPerScan = body.creditsPerScan ?? budget.creditsPerScan ?? creditsPerAction ?? 0;
    const influencerSpots = body.influencerSpots ?? budget.influencerSpots ?? budget.maxVisits;
    const rewardValue = body.rewardValue ?? budget.rewardValue;

    // Type-specific validation
    if (campaignType === 'pay_per_customer') {
      const validationError = validatePayPerCustomer({
        creditsPerCustomer,
        influencerSpots,
        totalCredits,
      });
      if (validationError) return validationError;
    }

    if (campaignType === 'media_event') {
      const validationError = validateMediaEvent({
        totalCredits,
        influencerSpots,
        eventDate: body.eventDate,
      });
      if (validationError) return validationError;
    }

    if (campaignType === 'loyalty_reward') {
      const validationError = validateLoyaltyReward({
        totalCredits,
        visibility: body.visibility,
        rewardValue,
      });
      if (validationError) return validationError;
    }

    // Validate campaign dates (iOS-compatible field names)
    const periodStart = body.periodStart;
    const periodEnd = body.periodEnd;
    const dateError = validateCampaignDates(periodStart, periodEnd);
    if (dateError) return dateError;

    // Sanitize string inputs
    const sanitizedTitle = sanitizeString(body.title, VALIDATION_CONSTRAINTS.STRING_LIMITS.title);
    const sanitizedDescription = sanitizeString(body.description, VALIDATION_CONSTRAINTS.STRING_LIMITS.description);
    const sanitizedRequirements = sanitizeString(body.requirements, VALIDATION_CONSTRAINTS.STRING_LIMITS.requirements);

    // Create campaign in Supabase with proper field mapping
    const campaignData = {
      business_id: user.id,
      title: sanitizedTitle,
      description: sanitizedDescription,
      campaign_type: campaignType,
      status: body.status || 'draft',
      period_start: periodStart,
      period_end: periodEnd,
      influencer_spots: influencerSpots,
      credits_per_action: creditsPerAction,
      credits_per_customer: creditsPerCustomer,
      credits_per_scan: creditsPerScan,
      total_credits: totalCredits,
      image_url: body.imageUrl,
      visibility: body.visibility || 'public',
      requirements: sanitizedRequirements,
      event_date: body.eventDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: campaign, error: createError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating campaign:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));

      // Provide more user-friendly error messages
      let errorMessage = 'Failed to create campaign';
      if (createError.code === '23502') {
        // NOT NULL constraint violation
        errorMessage = 'Missing required field. Please fill in all campaign details.';
      } else if (createError.code === '23505') {
        // Unique constraint violation
        errorMessage = 'A campaign with this name already exists.';
      } else if (createError.message) {
        errorMessage = createError.message;
      }

      return createErrorResponse(
        errorMessage,
        500,
        {
          code: ErrorCodes.DATABASE_ERROR,
          details: createError.message || createError.hint
        }
      );
    }

    if (!campaign) {
      console.error('Campaign created but no data returned');
      return createErrorResponse(
        'Campaign creation failed',
        500,
        {
          code: ErrorCodes.DATABASE_ERROR
        }
      );
    }

    // Transform snake_case keys to camelCase for frontend
    const transformedCampaign = transformKeysToCamelCase(campaign);

    // Map database fields to frontend Campaign interface (iOS-compatible)
    const mappedCampaign = {
      ...transformedCampaign,
      type: transformedCampaign.campaignType,
      periodStart: transformedCampaign.periodStart,
      periodEnd: transformedCampaign.periodEnd,
      visitCount: 0,
      pendingApplicationsCount: 0,
      // Flat budget fields (iOS structure)
      totalCredits: transformedCampaign.totalCredits || 0,
      creditsPerCustomer: transformedCampaign.creditsPerCustomer,
      creditsPerAction: transformedCampaign.creditsPerAction,
      influencerSpots: transformedCampaign.influencerSpots,
      influencerSpotsFilled: transformedCampaign.influencerSpotsFilled || 0,
      rewardValue: transformedCampaign.rewardValue,
    };

    return NextResponse.json(mappedCampaign, {
      headers: getRateLimitHeaders()
    });
  } catch (error) {
    console.error('Create campaign API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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
