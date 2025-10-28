import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const campaignId = searchParams.get('campaignId');

    // Fetch all influencers (users with influencer_profiles)
    let query = supabase
      .from('influencer_profiles')
      .select(`
        user_id,
        bio,
        social_media_handles,
        user_profiles!influencer_profiles_user_id_fkey (
          id,
          email,
          username,
          first_name,
          last_name,
          full_name,
          profile_image_url
        )
      `);

    const { data: influencers, error: influencersError } = await query;

    if (influencersError) {
      console.error('Error fetching influencers:', influencersError);
      return NextResponse.json(
        { error: 'Failed to fetch influencers' },
        { status: 500 }
      );
    }

    // Get existing applications for this campaign if campaignId is provided
    let existingApplications: any[] = [];
    if (campaignId) {
      const { data: applications } = await supabase
        .from('campaign_applications')
        .select('influencer_id, status, application_type')
        .eq('campaign_id', campaignId);

      existingApplications = applications || [];
    }

    // Transform and filter influencers
    const transformedInfluencers = (influencers || [])
      .filter((profile) => profile.user_profiles) // Only include profiles with user data
      .map((profile) => {
        const userProfile = profile.user_profiles as any;
        const firstName = userProfile.first_name || '';
        const lastName = userProfile.last_name || '';
        const fullNameFromParts = `${firstName} ${lastName}`.trim();
        const displayName = fullNameFromParts || userProfile.full_name || userProfile.username || 'Unknown';

        // Find existing application status
        const existingApp = existingApplications.find(
          (app) => app.influencer_id === profile.user_id
        );

        return {
          id: profile.user_id,
          name: displayName,
          username: userProfile.username,
          avatar: userProfile.profile_image_url,
          bio: profile.bio,
          socialMediaHandles: profile.social_media_handles,
          // Application status if exists
          applicationStatus: existingApp?.status,
          applicationType: existingApp?.application_type,
        };
      });

    // Apply search filter if provided
    let filteredInfluencers = transformedInfluencers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredInfluencers = transformedInfluencers.filter((influencer) => {
        const nameMatch = influencer.name?.toLowerCase().includes(searchLower);
        const usernameMatch = influencer.username?.toLowerCase().includes(searchLower);
        return nameMatch || usernameMatch;
      });
    }

    return NextResponse.json(filteredInfluencers);
  } catch (error) {
    console.error('Business influencers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
