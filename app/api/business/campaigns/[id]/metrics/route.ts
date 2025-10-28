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

    // Fetch campaign metrics
    // Count total applications
    const { count: totalApplications } = await supabase
      .from('campaign_applications')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    // Count accepted participants
    const { count: totalParticipants } = await supabase
      .from('campaign_applications')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('status', 'accepted');

    // Count total visits
    const { count: totalVisits } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    // Sum credits earned
    const { data: creditsData } = await supabase
      .from('visits')
      .select('credits_awarded')
      .eq('campaign_id', campaignId)
      .eq('status', 'verified');

    const totalCreditsSpent = creditsData?.reduce((sum, visit) => sum + (visit.credits_awarded || 0), 0) || 0;

    // Count content submissions
    const { count: totalContentSubmissions } = await supabase
      .from('content_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    // Count visitors from influencer referrals
    const { count: influencerVisitorCount } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .not('influencer_id', 'is', null);

    // Count visitors from direct app (no influencer attribution)
    const { count: directAppVisitorCount } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .is('influencer_id', null);

    // Build metrics response
    const metrics = {
      total_applications: totalApplications || 0,
      total_participants: totalParticipants || 0,
      total_visits: totalVisits || 0,
      influencer_visitor_count: influencerVisitorCount || 0,
      direct_app_visitor_count: directAppVisitorCount || 0,
      total_credits_spent: totalCreditsSpent,
      total_content_submissions: totalContentSubmissions || 0,
      conversion_rate: totalApplications ? ((totalParticipants || 0) / totalApplications * 100).toFixed(2) : '0.00',
    };

    // Transform to camelCase before returning
    const transformedMetrics = transformKeysToCamelCase(metrics);
    return NextResponse.json(transformedMetrics);
  } catch (error) {
    console.error('Campaign metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
