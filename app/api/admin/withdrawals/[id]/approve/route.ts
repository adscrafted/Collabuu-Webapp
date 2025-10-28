import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformKeysToCamelCase } from '@/lib/utils';
import { sendEmail } from '@/lib/email/service';
import { WithdrawalApprovedEmail } from '@/lib/email/templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PATCH /api/admin/withdrawals/[id]/approve
 * Approve a withdrawal request
 *
 * Request body:
 * {
 *   notes?: string
 * }
 */
export async function PATCH(
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

    // TODO: Verify admin role

    const { id } = params;
    const body = await request.json();
    const { notes } = body;

    // First, fetch the current withdrawal to verify it exists and check status
    const { data: currentWithdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('status, influencer_id, amount')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Withdrawal request not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching withdrawal:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch withdrawal request', details: fetchError.message },
        { status: 500 }
      );
    }

    // Verify the withdrawal is in pending status
    if (currentWithdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve withdrawal with status: ${currentWithdrawal.status}` },
        { status: 400 }
      );
    }

    // Update withdrawal status to approved
    const updateData: any = {
      status: 'approved',
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    const { data: updatedWithdrawal, error: updateError } = await supabase
      .from('withdrawal_requests')
      .update(updateData)
      .eq('id', id)
      .select('*, influencer:influencer_id(id, name, email, avatar_url)')
      .single();

    if (updateError) {
      console.error('Error approving withdrawal:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve withdrawal request', details: updateError.message },
        { status: 500 }
      );
    }

    // Transform to camelCase and enrich with influencer data
    const transformed = transformKeysToCamelCase(updatedWithdrawal);
    const influencerData = updatedWithdrawal.influencer;

    const enrichedWithdrawal = {
      ...transformed,
      influencerName: influencerData?.name,
      influencerEmail: influencerData?.email,
      influencerAvatar: influencerData?.avatar_url,
    };

    // Send email notification to influencer about approval
    if (influencerData?.email) {
      try {
        await sendEmail({
          to: influencerData.email,
          subject: 'Withdrawal Approved - Payment Processing',
          react: WithdrawalApprovedEmail({
            influencerName: influencerData.name || 'Influencer',
            amount: updatedWithdrawal.amount,
            credits: updatedWithdrawal.credits,
            requestedAt: updatedWithdrawal.requested_at,
            etransferEmail: updatedWithdrawal.etransfer_email,
          }),
        });
        console.log(`Approval email sent to ${influencerData.email}`);
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send approval email:', emailError);
      }
    }

    return NextResponse.json(enrichedWithdrawal);
  } catch (error) {
    console.error('Approve withdrawal API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
