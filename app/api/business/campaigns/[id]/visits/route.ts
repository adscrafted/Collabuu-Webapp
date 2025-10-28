import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, business_id')
      .eq('id', campaignId)
      .eq('business_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, verified, rejected
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query - join with profiles for user data
    let query = supabase
      .from('visits')
      .select(`
        *,
        influencer:influencer_id!inner (
          id,
          email,
          username,
          full_name,
          profile_image_url
        ),
        customer:customer_id!inner (
          id,
          email,
          username,
          full_name
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: visits, error: visitsError } = await query;

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
      return NextResponse.json(
        { error: 'Failed to fetch visits' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedVisits = visits?.map(visit => ({
      id: visit.id,
      campaignId: visit.campaign_id,
      influencerId: visit.influencer_id,
      customerId: visit.customer_id,
      businessId: visit.business_id,
      status: visit.status,
      creditsAwarded: visit.credits_awarded,
      creditsEarned: visit.credits_earned,
      loyaltyPointsEarned: visit.loyalty_points_earned,
      visitDate: visit.visit_date,
      visitType: visit.visit_type,
      verificationMethod: visit.verification_method,
      createdAt: visit.created_at,
      approvedAt: visit.approved_at,
      influencer: visit.influencer ? {
        id: visit.influencer.id,
        email: visit.influencer.email,
        username: visit.influencer.username,
        fullName: visit.influencer.full_name,
        profileImageUrl: visit.influencer.profile_image_url,
      } : null,
      customer: visit.customer ? {
        id: visit.customer.id,
        email: visit.customer.email,
        username: visit.customer.username,
        fullName: visit.customer.full_name,
      } : null,
    })) || [];

    return NextResponse.json(transformedVisits);
  } catch (error) {
    console.error('Visits API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
