import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    // Verify campaign ownership
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, business_id, status')
      .eq('id', campaignId)
      .eq('business_id', user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { influencer_id, influencerIds } = body;

    // Support both single and bulk invitations
    const idsToInvite = influencerIds || (influencer_id ? [influencer_id] : []);

    if (idsToInvite.length === 0) {
      return NextResponse.json(
        { error: 'No influencer IDs provided' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const influencerId of idsToInvite) {
      try {
        // Check if an application/invitation already exists
        const { data: existingApp } = await supabase
          .from('campaign_applications')
          .select('id, status')
          .eq('campaign_id', campaignId)
          .eq('influencer_id', influencerId)
          .single();

        if (existingApp) {
          // If withdrawn, we can re-invite
          if (existingApp.status === 'withdrawn') {
            const { error: updateError } = await supabase
              .from('campaign_applications')
              .update({
                status: 'pending',
                application_type: 'invitation',
                applied_at: new Date().toISOString(),
                reviewed_at: null,
              })
              .eq('id', existingApp.id);

            if (updateError) {
              errors.push({ influencerId, error: 'Failed to update invitation' });
              continue;
            }

            results.push({ influencerId, status: 'reinvited' });
          } else {
            // Already has an application/invitation
            errors.push({ influencerId, error: 'Already has an application or invitation' });
            continue;
          }
        } else {
          // Create new invitation
          const { error: insertError } = await supabase
            .from('campaign_applications')
            .insert({
              campaign_id: campaignId,
              influencer_id: influencerId,
              status: 'pending',
              application_type: 'invitation',
              applied_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error('Error creating invitation:', insertError);
            errors.push({ influencerId, error: 'Failed to create invitation' });
            continue;
          }

          results.push({ influencerId, status: 'invited' });
        }
      } catch (error) {
        console.error(`Error inviting influencer ${influencerId}:`, error);
        errors.push({ influencerId, error: 'Unexpected error' });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      total: idsToInvite.length,
      successful: results.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error('Invite influencers API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
