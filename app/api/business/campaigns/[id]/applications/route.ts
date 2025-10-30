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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, accepted, rejected, withdrawn

    // Build query - join with user_profiles and influencer_profiles for complete user data
    let query = supabase
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
      .order('applied_at', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error: applicationsError } = await query;

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    // Fetch social media handles for each influencer
    const applicationsWithSocial = await Promise.all(
      (applications || []).map(async (app) => {
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
        const displayName = fullNameFromParts || app.influencer?.full_name || app.influencer?.username || null;

        return {
          id: app.id,
          campaignId: app.campaign_id,
          influencerId: app.influencer_id,
          influencerName: displayName,
          influencerUsername: app.influencer?.username,
          influencerAvatar: app.influencer?.profile_image_url,
          status: app.status,
          applicationType: app.application_type || 'application',
          applicationMessage: app.application_message,
          appliedAt: app.applied_at,
          reviewedAt: app.reviewed_at,
          reviewerNotes: app.reviewer_notes,
          socialMediaHandles: influencerProfile?.social_media_handles || undefined,
        };
      })
    );

    return NextResponse.json(applicationsWithSocial);
  } catch (error) {
    console.error('Campaign applications API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
