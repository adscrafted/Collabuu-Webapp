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

    // Build query - join with profiles for user data
    let query = supabase
      .from('content_submissions')
      .select(`
        *,
        influencer:influencer_id!inner (
          id,
          email,
          username,
          full_name,
          profile_image_url
        )
      `)
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

    // Transform the data to match the expected format
    const transformedContent = contentSubmissions?.map(content => ({
      id: content.id,
      campaignId: content.campaign_id,
      influencerId: content.influencer_id,
      contentType: content.content_type,
      contentUrl: content.content_url,
      platform: content.platform,
      status: content.status,
      submittedAt: content.submitted_at,
      message: content.message,
      createdAt: content.created_at,
      influencer: content.influencer ? {
        id: content.influencer.id,
        email: content.influencer.email,
        username: content.influencer.username,
        fullName: content.influencer.full_name,
        profileImageUrl: content.influencer.profile_image_url,
      } : null,
    })) || [];

    return NextResponse.json(transformedContent);
  } catch (error) {
    console.error('Content submissions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
