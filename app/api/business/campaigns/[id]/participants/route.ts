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

    // Verify campaign ownership and get credits rate
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

    // Fetch participants (accepted applications) with their stats
    const { data: applications, error: applicationsError } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        influencer:user_profiles!campaign_applications_influencer_id_fkey (
          id,
          email,
          username,
          first_name,
          last_name,
          full_name,
          profile_image_url
        )
      `)
      .eq('campaign_id', campaignId)
      .eq('status', 'accepted')
      .order('reviewed_at', { ascending: false });

    if (applicationsError) {
      console.error('Error fetching participants:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    // PERFORMANCE OPTIMIZATION: Batch fetch all participant stats instead of N+1 queries
    const influencerIds = (applications || []).map(app => app.influencer_id);

    // Batch fetch all data in parallel (3 queries instead of N*3)
    const [redemptionsData, contentData, profilesData] = await Promise.all([
      // Single query for all QR code redemptions
      supabase
        .from('qr_code_redemptions')
        .select('influencer_id, customer_id')
        .eq('campaign_id', campaignId)
        .in('influencer_id', influencerIds)
        .not('customer_id', 'is', null),

      // Single query for all content submissions
      supabase
        .from('content_submissions')
        .select('influencer_id')
        .eq('campaign_id', campaignId)
        .in('influencer_id', influencerIds),

      // Single query for all influencer profiles
      supabase
        .from('influencer_profiles')
        .select('user_id, social_media_handles')
        .in('user_id', influencerIds)
    ]);

    // Build lookup maps for O(1) access
    const redemptionsByInfluencer = new Map();
    const contentByInfluencer = new Map();
    const profilesByInfluencer = new Map();

    // Initialize maps
    influencerIds.forEach(id => {
      redemptionsByInfluencer.set(id, []);
      contentByInfluencer.set(id, 0);
    });

    // Aggregate redemptions
    if (redemptionsData.data) {
      redemptionsData.data.forEach((redemption: any) => {
        const redemptions = redemptionsByInfluencer.get(redemption.influencer_id) || [];
        redemptions.push(redemption.customer_id);
        redemptionsByInfluencer.set(redemption.influencer_id, redemptions);
      });
    }

    // Count content submissions
    if (contentData.data) {
      contentData.data.forEach((content: any) => {
        const count = contentByInfluencer.get(content.influencer_id) || 0;
        contentByInfluencer.set(content.influencer_id, count + 1);
      });
    }

    // Map profiles
    if (profilesData.data) {
      profilesData.data.forEach((profile: any) => {
        profilesByInfluencer.set(profile.user_id, profile);
      });
    }

    // Calculate campaign rate once
    const creditsPerVisit = campaign.credits_per_customer || campaign.credits_per_action || 0;

    // Map participants with pre-fetched stats (no database queries in loop)
    const participantsWithStats = (applications || []).map((app) => {
      // Get unique customer count from redemptions
      const redemptions = redemptionsByInfluencer.get(app.influencer_id) || [];
      const customerCount = new Set(redemptions).size;
      const visitCount = customerCount;

      // Calculate credits earned
      const creditsEarned = customerCount * creditsPerVisit;

      // Get content count
      const contentCount = contentByInfluencer.get(app.influencer_id) || 0;

      // Get profile
      const influencerProfile = profilesByInfluencer.get(app.influencer_id);

      // Construct full name from first_name + last_name, fallback to full_name or username
      const firstName = app.influencer?.first_name || '';
      const lastName = app.influencer?.last_name || '';
      const fullNameFromParts = `${firstName} ${lastName}`.trim();
      const displayName = fullNameFromParts || app.influencer?.full_name || app.influencer?.username || null;

      return {
        id: app.id,
        campaignId: app.campaign_id,
        userId: app.influencer_id,
        influencerId: app.influencer_id,
        influencerName: displayName,
        influencerUsername: app.influencer?.username,
        influencerAvatar: app.influencer?.profile_image_url,
        joinedAt: app.reviewed_at || app.applied_at,
        visitsGenerated: visitCount || 0,
        visitCount: visitCount || 0,
        conversions: 0, // TODO: Calculate actual conversions when we have that data
        creditsEarned: creditsEarned,
        customerCount: customerCount,
        totalContentSubmitted: contentCount,
        lastActivityAt: null, // TODO: Track last activity
        socialMediaHandles: influencerProfile?.social_media_handles || undefined,
      };
    });

    return NextResponse.json(participantsWithStats);
  } catch (error) {
    console.error('Campaign participants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
