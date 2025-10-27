import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const campaignId = params.id;
    const { status } = await request.json();

    // Update campaign status in Supabase
    const { data: campaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .eq('business_id', user.id) // Ensure user owns this campaign
      .select()
      .single();

    if (updateError) {
      console.error('Error updating campaign status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update campaign status' },
        { status: 500 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Update campaign status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
