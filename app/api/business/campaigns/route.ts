import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformKeysToCamelCase } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const { data: campaigns, error: campaignsError } = await query;

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
      return NextResponse.json(
        { error: 'Failed to fetch campaigns' },
        { status: 500 }
      );
    }

    // Transform snake_case keys to camelCase for frontend
    const transformedCampaigns = transformKeysToCamelCase(campaigns || []);

    // Fetch stats for each campaign
    const campaignsWithStats = await Promise.all(
      transformedCampaigns.map(async (campaign: any) => {
        // Count total visits
        const { count: visitsCount } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id);

        // Count accepted participants
        const { count: participantsCount } = await supabase
          .from('campaign_applications')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaign.id)
          .eq('status', 'accepted');

        // Sum credits spent
        const { data: creditsData } = await supabase
          .from('visits')
          .select('credits_awarded')
          .eq('campaign_id', campaign.id)
          .eq('status', 'verified');

        const creditsSpent = creditsData?.reduce((sum, visit) => sum + (visit.credits_awarded || 0), 0) || 0;

        // Count accepted influencers (same as participants for now)
        const acceptedInfluencersCount = participantsCount || 0;

        return {
          ...campaign,
          type: campaign.campaignType || campaign.paymentType,
          startDate: campaign.periodStart,
          endDate: campaign.periodEnd,
          budget: {
            totalCredits: campaign.totalCredits || 0,
            creditsPerCustomer: campaign.creditsPerCustomer || campaign.creditsPerAction,
            creditsPerAction: campaign.creditsPerAction,
            maxVisits: campaign.influencerSpots,
            influencerSpots: campaign.influencerSpots,
            influencerSpotsFilled: campaign.influencerSpotsFilled || 0,
            rewardValue: campaign.rewardValue,
          },
          stats: {
            visitsCount: visitsCount || 0,
            participantsCount: participantsCount || 0,
            creditsSpent,
            acceptedInfluencersCount,
          },
        };
      })
    );

    // Return campaigns array (webapp expects array, not wrapped object)
    return NextResponse.json(campaignsWithStats);
  } catch (error) {
    console.error('Campaigns API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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

    // Create campaign in Supabase
    const campaignData = {
      business_id: user.id,
      title: body.title,
      description: body.description,
      payment_type: body.paymentType,
      status: body.status || 'draft',
      period_start: body.periodStart,
      period_end: body.periodEnd,
      influencer_spots: body.influencerSpots,
      credits_per_action: body.creditsPerAction,
      credits_per_customer: body.creditsPerCustomer,
      total_credits: body.totalCredits,
      image_url: body.imageUrl,
      visibility: body.visibility || 'public',
      requirements: body.requirements,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: campaign, error: createError } = await supabase
      .from('campaigns')
      .insert(campaignData)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating campaign:', createError);
      console.error('❌ Error details:', JSON.stringify(createError, null, 2));
      return NextResponse.json(
        {
          error: 'Failed to create campaign',
          details: createError.message,
          hint: createError.hint,
        },
        { status: 500 }
      );
    }

    // Transform snake_case keys to camelCase for frontend
    const transformedCampaign = transformKeysToCamelCase(campaign);

    // Map database fields to frontend Campaign interface
    const mappedCampaign = {
      ...transformedCampaign,
      type: transformedCampaign.campaignType || transformedCampaign.paymentType,
      startDate: transformedCampaign.periodStart,
      endDate: transformedCampaign.periodEnd,
    };

    return NextResponse.json(mappedCampaign);
  } catch (error) {
    console.error('❌ Create campaign API error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
