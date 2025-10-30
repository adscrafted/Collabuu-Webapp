import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractThumbnail, detectPlatform, type Platform } from '@/lib/utils/thumbnail-utils';

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

    if (process.env.NODE_ENV === 'development') {
      console.log('[Content Submissions API] Content submissions count:', contentSubmissions?.length);
    }

    // Fetch all influencer profiles in one query (table is user_profiles, not profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name, full_name, profile_image_url')
      .in('id', influencerIds);

    if (profilesError) {
      console.error('[Content Submissions API] Error fetching influencer profiles');
    }

    // Create a map of influencer profiles for quick lookup
    const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Transform the data to match the expected ContentSubmission interface
    const transformedContent = await Promise.all((contentSubmissions || []).map(async (content: any) => {
      const profile = profilesMap.get(content.influencer_id);

      // Construct full name from first_name + last_name, fallback to full_name or username
      const firstName = profile?.first_name || '';
      const lastName = profile?.last_name || '';
      const fullNameFromParts = `${firstName} ${lastName}`.trim();
      const displayName = fullNameFromParts || profile?.full_name || profile?.username || null;

      // If thumbnail is missing, try to extract it on-the-fly (only for supported platforms)
      let thumbnailUrl = content.thumbnail_url;
      if (!thumbnailUrl && content.content_url) {
        const platform = content.platform || detectPlatform(content.content_url);

        // Only attempt extraction for platforms that support server-side extraction
        // Instagram is not supported due to bot detection (requires manual upload or API integration)
        if (platform === 'youtube' || platform === 'tiktok') {
          try {
            const result = await extractThumbnail(content.content_url, platform);

            if (result.thumbnailUrl) {
              thumbnailUrl = result.thumbnailUrl;

              // Update the database with the extracted thumbnail
              await supabase
                .from('content_submissions')
                .update({
                  thumbnail_url: result.thumbnailUrl,
                  platform: platform // Also update platform if it was auto-detected
                })
                .eq('id', content.id);

              if (process.env.NODE_ENV === 'development') {
                console.log('[Content Submissions] Auto-extracted and saved thumbnail');
              }
            }
          } catch (error) {
            console.warn('[Content Submissions] Failed to auto-extract thumbnail');
          }
        }
      }

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
        imageUrl: thumbnailUrl || content.content_url, // Use extracted/saved thumbnail or content URL for images
        caption: content.caption || content.message,
        status: content.status, // new, viewed, approved
        postedAt: content.posted_at || content.submitted_at || content.created_at,
        viewedAt: content.viewed_at,
      };
    }));

    return NextResponse.json(transformedContent);
  } catch (error) {
    console.error('Content submissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify the JWT token and get user (influencer)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const campaignId = id;

    // Get request body
    const body = await request.json();
    const { contentUrl, platform, contentType, caption, postedAt } = body;

    // Validate required fields
    if (!contentUrl) {
      return NextResponse.json(
        { error: 'Content URL is required' },
        { status: 400 }
      );
    }

    // Verify campaign exists and user is an accepted participant
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .select('id, campaign_id, status')
      .eq('campaign_id', campaignId)
      .eq('influencer_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (applicationError || !application) {
      return NextResponse.json(
        { error: 'You are not an accepted participant of this campaign' },
        { status: 403 }
      );
    }

    // Auto-detect platform if not provided
    const detectedPlatform: Platform = platform || detectPlatform(contentUrl);

    // Extract thumbnail from the content URL (only for supported platforms)
    // Instagram is not supported due to bot detection - will return null
    let thumbnailResult: { thumbnailUrl: string | null; error?: string } = { thumbnailUrl: null };

    if (detectedPlatform === 'youtube' || detectedPlatform === 'tiktok') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Content Submission] Extracting thumbnail for platform:', detectedPlatform);
      }
      thumbnailResult = await extractThumbnail(contentUrl, detectedPlatform);

      if (thumbnailResult.error) {
        console.warn('[Content Submission] Thumbnail extraction warning');
      }
    } else if (detectedPlatform === 'instagram') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Content Submission] Instagram detected - thumbnail extraction not supported');
      }
    }

    // Create content submission with auto-extracted thumbnail
    const { data: submission, error: createError } = await supabase
      .from('content_submissions')
      .insert({
        campaign_id: campaignId,
        influencer_id: user.id,
        content_url: contentUrl,
        platform: detectedPlatform,
        content_type: contentType || 'post',
        caption: caption,
        thumbnail_url: thumbnailResult.thumbnailUrl, // Auto-extracted thumbnail
        status: 'new',
        posted_at: postedAt || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('[Content Submission] Error creating submission:', createError);
      return NextResponse.json(
        { error: 'Failed to create content submission' },
        { status: 500 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[Content Submission] Created successfully');
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('[Content Submission] API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
