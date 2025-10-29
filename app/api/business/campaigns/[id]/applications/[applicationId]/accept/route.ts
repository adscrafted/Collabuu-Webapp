import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Generate a unique 8-character alphanumeric referral code
function generateReferralCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
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

    const { id: campaignId, applicationId } = await params;

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

    // Get the application
    const { data: application, error: appError } = await supabase
      .from('campaign_applications')
      .select('*')
      .eq('id', applicationId)
      .eq('campaign_id', campaignId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if application is already accepted or rejected
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: `Application is already ${application.status}` },
        { status: 400 }
      );
    }

    // Generate referral code for attribution tracking
    const referralCode = generateReferralCode();

    // Update application status to 'accepted'
    const { error: updateError } = await supabase
      .from('campaign_applications')
      .update({
        status: 'accepted',
        reviewed_at: new Date().toISOString(),
        referral_code: referralCode,
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept application' },
        { status: 500 }
      );
    }

    // Check if participant already exists
    const { data: existingParticipant } = await supabase
      .from('campaign_participants')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('user_id', application.influencer_id)
      .single();

    // Create campaign participant entry if it doesn't exist
    if (!existingParticipant) {
      const { error: participantError } = await supabase
        .from('campaign_participants')
        .insert({
          campaign_id: campaignId,
          user_id: application.influencer_id,
          joined_at: new Date().toISOString(),
        });

      if (participantError) {
        console.error('Error creating participant:', participantError);
        // Don't fail the request if participant creation fails
        // The application is already accepted
      }
    }

    // Return empty response (matching iOS behavior)
    return NextResponse.json({});
  } catch (error) {
    console.error('Accept application API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
