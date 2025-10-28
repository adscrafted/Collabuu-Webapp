import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformKeysToCamelCase } from '@/lib/utils';

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

    // Verify campaign ownership and get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, business_id, credits_per_customer, credits_per_action')
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

    // Count content submissions
    const { count: totalContentSubmissions } = await supabase
      .from('content_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId);

    // Calculate visitor counts from QR code redemptions (matching iOS implementation)
    // Use Sets to count UNIQUE customers, not total redemptions
    const { data: redemptions } = await supabase
      .from('qr_code_redemptions')
      .select('customer_id, influencer_id')
      .eq('campaign_id', campaignId)
      .not('customer_id', 'is', null);

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

    // Calculate total credits spent from visitor count × credits per customer
    const totalVisitors = influencerVisitorCount + directAppVisitorCount;
    const creditsPerVisit = campaign.credits_per_customer || campaign.credits_per_action || 0;
    const totalCreditsSpent = totalVisitors * creditsPerVisit;

    // Build metrics response
    const metrics = {
      total_applications: totalApplications || 0,
      total_participants: totalParticipants || 0,
      // Total visits is the sum of influencer and direct app visitors
      total_visits: totalVisitors,
      // Visitor attribution from QR code redemptions (matching iOS)
      influencer_visitor_count: influencerVisitorCount,
      direct_app_visitor_count: directAppVisitorCount,
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
