import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { transformKeysToCamelCase } from '@/lib/utils';
import { sendEmail } from '@/lib/email/service';
import { WithdrawalRejectedEmail } from '@/lib/email/templates';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * PATCH /api/admin/withdrawals/[id]/reject
 * Reject a withdrawal request with reason
 *
 * Request body:
 * {
 *   reason: string (required)
 *   notes?: string
 * }
 */
export async function PATCH(
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

    // TODO: Verify admin role

    const { id } = await params;
    const body = await request.json();
    const { reason, notes } = body;

    // Validate required fields
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // First, fetch the current withdrawal to verify it exists and check status
    const { data: currentWithdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('status, influencer_id, credits')
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
        { error: `Cannot reject withdrawal with status: ${currentWithdrawal.status}. Must be pending.` },
        { status: 400 }
      );
    }

    // When rejecting, we need to refund the credits back to the influencer
    // First, update the withdrawal status
    const updateData: any = {
      status: 'rejected',
      rejection_reason: reason.trim(),
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
      console.error('Error rejecting withdrawal:', updateError);
      return NextResponse.json(
        { error: 'Failed to reject withdrawal request', details: updateError.message },
        { status: 500 }
      );
    }

    // Refund credits back to the influencer's balance
    const { error: refundError } = await supabase.rpc('increment_influencer_credits', {
      p_influencer_id: currentWithdrawal.influencer_id,
      p_credits: currentWithdrawal.credits,
    });

    if (refundError) {
      console.error('Error refunding credits:', refundError);
      // Log the error but don't fail the request - the rejection was successful
      // We can manually adjust credits later if needed
      console.warn(`Failed to refund ${currentWithdrawal.credits} credits to influencer ${currentWithdrawal.influencer_id}`);
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

    // Send email notification to influencer about rejection
    if (influencerData?.email) {
      try {
        await sendEmail({
          to: influencerData.email,
          subject: 'Withdrawal Request Declined - Credits Restored',
          react: WithdrawalRejectedEmail({
            influencerName: influencerData.name || 'Influencer',
            amount: updatedWithdrawal.amount,
            credits: updatedWithdrawal.credits,
            requestedAt: updatedWithdrawal.requested_at,
            rejectedAt: updatedWithdrawal.processed_at || new Date().toISOString(),
            rejectionReason: updatedWithdrawal.rejection_reason,
            etransferEmail: updatedWithdrawal.etransfer_email,
          }),
        });
        console.log(`Rejection email sent to ${influencerData.email}`);
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send rejection email:', emailError);
      }
    }

    return NextResponse.json(enrichedWithdrawal);
  } catch (error) {
    console.error('Reject withdrawal API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
