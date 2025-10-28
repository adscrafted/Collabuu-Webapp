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

    // For each participant, fetch their stats and social media
    const participantsWithStats = await Promise.all(
      (applications || []).map(async (app) => {
        // Count unique customers from QR code redemptions (matching iOS implementation)
        const { data: redemptions } = await supabase
          .from('qr_code_redemptions')
          .select('customer_id')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', app.influencer_id)
          .not('customer_id', 'is', null);

        const customerCount = redemptions ? new Set(redemptions.map(r => r.customer_id)).size : 0;
        // Visit count equals customer count (each unique customer is a visit)
        const visitCount = customerCount;

        // Sum credits earned
        const { data: creditsData } = await supabase
          .from('visits')
          .select('credits_awarded')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', app.influencer_id)
          .eq('status', 'verified');

        const creditsEarned = creditsData?.reduce((sum, visit) => sum + (visit.credits_awarded || 0), 0) || 0;

        // Count content submissions
        const { count: contentCount } = await supabase
          .from('content_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', campaignId)
          .eq('influencer_id', app.influencer_id);

        // Get social media handles from influencer_profiles table
        const { data: influencerProfile } = await supabase
          .from('influencer_profiles')
          .select('social_media_handles')
          .eq('user_id', app.influencer_id)
          .single();

        // Construct full name from first_name + last_name, fallback to full_name or username
        const firstName = app.influencer?.first_name || '';
        const lastName = app.influencer?.last_name || '';
        const fullNameFromParts = `${firstName} ${lastName}`.trim();
        const displayName = fullNameFromParts || app.influencer?.full_name || app.influencer?.username || 'Unknown';

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
          totalContentSubmitted: contentCount || 0,
          lastActivityAt: null, // TODO: Track last activity
          socialMediaHandles: influencerProfile?.social_media_handles || undefined,
        };
      })
    );

    return NextResponse.json(participantsWithStats);
  } catch (error) {
    console.error('Campaign participants API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
