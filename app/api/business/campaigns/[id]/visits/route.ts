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

    // Fetch QR code redemptions for visitor timeline (matching iOS implementation)
    // Each redemption represents a visit
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('qr_code_redemptions')
      .select('id, customer_id, influencer_id, redeemed_at')
      .eq('campaign_id', campaignId)
      .not('customer_id', 'is', null)
      .order('redeemed_at', { ascending: false });

    if (redemptionsError) {
      console.error('Error fetching redemptions:', redemptionsError);
      return NextResponse.json(
        { error: 'Failed to fetch visit data' },
        { status: 500 }
      );
    }

    // Get campaign details for credits calculation
    const { data: campaignData } = await supabase
      .from('campaigns')
      .select('credits_per_customer, credits_per_action')
      .eq('id', campaignId)
      .single();

    const creditsPerVisit = campaignData?.credits_per_customer || campaignData?.credits_per_action || 0;

    // Transform redemptions to visit format for the chart
    const transformedVisits = redemptions?.map(redemption => ({
      id: redemption.id,
      campaignId: campaignId,
      influencerId: redemption.influencer_id,
      customerId: redemption.customer_id,
      businessId: campaign.business_id,
      status: 'verified', // QR redemptions are auto-verified
      creditsAwarded: creditsPerVisit,
      visitDate: redemption.redeemed_at,
      visitType: 'qr_redemption',
      verificationMethod: 'qr_scan',
      createdAt: redemption.redeemed_at,
      approvedAt: redemption.redeemed_at,
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
