import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformKeysToCamelCase } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
      console.error('❌ Error fetching campaign:', campaignError);

      if (campaignError.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to fetch campaign' },
        { status: 500 }
      );
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
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

    return NextResponse.json(mappedCampaign);
  } catch (error) {
    console.error('Campaign detail API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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

    // Update campaign in Supabase
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        title: body.title,
        description: body.description,
        payment_type: body.paymentType,
        status: body.status,
        period_start: body.periodStart,
        period_end: body.periodEnd,
        influencer_spots: body.influencerSpots,
        credits_per_action: body.creditsPerAction,
        credits_per_customer: body.creditsPerCustomer,
        total_credits: body.totalCredits,
        image_url: body.imageUrl,
        visibility: body.visibility,
        requirements: body.requirements,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq('business_id', user.id) // Ensure user owns this campaign
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campaign:', updateError);
      return NextResponse.json(
        { error: 'Failed to update campaign' },
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

    return NextResponse.json(mappedCampaign);
  } catch (error) {
    console.error('Update campaign API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('business_id', user.id); // Ensure user owns this campaign

    if (deleteError) {
      console.error('Error deleting campaign:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete campaign' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete campaign API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
