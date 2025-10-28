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
    const status = searchParams.get('status'); // new, viewed, approved, rejected

    // Build query
    let query = supabase
      .from('content_submissions')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('submitted_at', { ascending: false });

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: contentSubmissions, error: contentError } = await query;

    if (contentError) {
      console.error('Error fetching content submissions:', contentError);
      return NextResponse.json(
        { error: 'Failed to fetch content submissions' },
        { status: 500 }
      );
    }

    // Get unique influencer IDs
    const influencerIds = [...new Set(contentSubmissions?.map(c => c.influencer_id).filter(Boolean))];

    console.log('[Content Submissions API] Content submissions count:', contentSubmissions?.length);
    console.log('[Content Submissions API] Influencer IDs:', influencerIds);

    // Fetch all influencer profiles in one query (table is user_profiles, not profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name, full_name, profile_image_url')
      .in('id', influencerIds);

    if (profilesError) {
      console.error('[Content Submissions API] Error fetching influencer profiles:', profilesError);
    } else {
      console.log('[Content Submissions API] Successfully fetched profiles from user_profiles table');
    }

    console.log('[Content Submissions API] Profiles fetched:', profiles?.length);

    // Log each profile's name fields specifically
    profiles?.forEach((p: any) => {
      console.log(`[Content Submissions API] Profile ${p.id}:`, {
        id: p.id,
        username: p.username,
        first_name: p.first_name,
        last_name: p.last_name,
        full_name: p.full_name,
        profile_image_url: p.profile_image_url
      });
    });

    // Create a map of influencer profiles for quick lookup
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Transform the data to match the expected ContentSubmission interface
    const transformedContent = contentSubmissions?.map((content: any) => {
      const profile = profilesMap.get(content.influencer_id);

      // Construct full name from first_name + last_name, fallback to full_name or username
      const firstName = profile?.first_name || '';
      const lastName = profile?.last_name || '';
      const fullNameFromParts = `${firstName} ${lastName}`.trim();
      const displayName = fullNameFromParts || profile?.full_name || profile?.username || 'Unknown';

      return {
        id: content.id,
        campaignId: content.campaign_id,
        influencerId: content.influencer_id,
        // Flatten influencer fields
        influencerName: displayName,
        influencerUsername: profile?.username,
        influencerAvatar: profile?.profile_image_url,
        // Map content fields to expected format
        postType: content.content_type, // video, image, post
        platform: content.platform, // instagram, youtube, tiktok, other
        contentUrl: content.content_url,
        imageUrl: content.thumbnail_url || content.content_url, // Use thumbnail or content URL for images
        caption: content.caption || content.message,
        status: content.status, // new, viewed, approved
        postedAt: content.posted_at || content.submitted_at || content.created_at,
        viewedAt: content.viewed_at,
      };
    }) || [];

    return NextResponse.json(transformedContent);
  } catch (error) {
    console.error('Content submissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
