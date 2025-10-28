import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
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

    const { id: campaignId, participantId } = await params;

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

    // Get the participant (which is actually an application record)
    const { data: application, error: appError } = await supabase
      .from('campaign_applications')
      .select('*')
      .eq('id', participantId)
      .eq('campaign_id', campaignId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if application is currently accepted
    if (application.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Participant is not active in this campaign' },
        { status: 400 }
      );
    }

    // Parse request body for optional reason
    let reason: string | undefined;
    try {
      const body = await request.json();
      reason = body.reason;
    } catch {
      // Empty body is fine
    }

    // Update application status to 'removed'
    const { error: updateError } = await supabase
      .from('campaign_applications')
      .update({
        status: 'removed',
        reviewer_notes: reason || null,
      })
      .eq('id', participantId);

    if (updateError) {
      console.error('Error removing participant:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove participant' },
        { status: 500 }
      );
    }

    // Optionally delete the campaign_participants entry if it exists
    const { error: deleteParticipantError } = await supabase
      .from('campaign_participants')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('user_id', application.influencer_id);

    if (deleteParticipantError) {
      console.error('Error deleting participant entry:', deleteParticipantError);
      // Don't fail the request if participant deletion fails
      // The application is already marked as removed
    }

    // Return empty response (matching iOS behavior)
    return NextResponse.json({});
  } catch (error) {
    console.error('Remove participant API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
