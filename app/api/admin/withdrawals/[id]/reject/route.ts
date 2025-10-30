import { NextRequest, NextResponse } from 'next/server';
import { transformKeysToCamelCase } from '@/lib/utils';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateAdmin, logAdminApiAction, logAdminApiError } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';
import { sendEmail } from '@/lib/email/service';
import { WithdrawalRejectedEmail } from '@/lib/email/templates';

/**
 * PATCH /api/admin/withdrawals/[id]/reject
 * Reject a withdrawal request with reason
 *
 * SECURITY:
 * - Requires admin authentication (moderator level or higher)
 * - Logs all rejection actions to audit trail with reasons
 * - Rate limited to prevent abuse
 * - Tracks admin who rejected the withdrawal and reason
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
  // Authenticate admin with moderator level (can approve/reject)
  const authResult = await authenticateAdmin(request, {
    requiredLevel: AdminLevel.MODERATOR,
    action: 'withdrawal.reject',
    rateLimitPerMinute: 30, // 30 rejections per minute max
  });

  if (!authResult.authorized || !authResult.context) {
    // Log unauthorized access attempt
    if (authResult.context) {
      await logAdminApiError(
        authResult.context,
        'withdrawal.reject',
        'withdrawal',
        'Unauthorized rejection attempt'
      );
    }
    return authResult.response!;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { reason, notes } = body;

    // Validate required fields
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
      // Log validation error
      await logAdminApiError(
        authResult.context,
        'withdrawal.reject',
        'withdrawal',
        'Missing rejection reason',
        id
      );

      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createServiceRoleClient();

    // First, fetch the current withdrawal to verify it exists and check status
    const { data: currentWithdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('status, influencer_id, credits, amount')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Log not found error
        await logAdminApiError(
          authResult.context,
          'withdrawal.reject',
          'withdrawal',
          `Withdrawal request not found: ${id}`,
          id
        );

        return NextResponse.json(
          { error: 'Withdrawal request not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching withdrawal:', fetchError);

      // Log database error
      await logAdminApiError(
        authResult.context,
        'withdrawal.reject',
        'withdrawal',
        `Database error: ${fetchError.message}`,
        id
      );

      return NextResponse.json(
        { error: 'Failed to fetch withdrawal request', details: fetchError.message },
        { status: 500 }
      );
    }

    // Verify the withdrawal is in pending status
    if (currentWithdrawal.status !== 'pending') {
      // Log invalid state transition attempt
      await logAdminApiError(
        authResult.context,
        'withdrawal.reject',
        'withdrawal',
        `Invalid status transition: Cannot reject withdrawal with status ${currentWithdrawal.status}`,
        id
      );

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

      // Log update error
      await logAdminApiError(
        authResult.context,
        'withdrawal.reject',
        'withdrawal',
        `Failed to update withdrawal: ${updateError.message}`,
        id
      );

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
      console.error('Error refunding credits');
      // Log the error but don't fail the request - the rejection was successful
      // We can manually adjust credits later if needed
      await logAdminApiError(
        authResult.context,
        'withdrawal.reject',
        'withdrawal',
        `Credit refund failed: ${refundError.message}`,
        id
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

    // Log successful rejection to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.reject',
      'withdrawal',
      id,
      {
        influencerId: currentWithdrawal.influencer_id,
        amount: currentWithdrawal.amount,
        credits: currentWithdrawal.credits,
        reason: reason.trim(),
        notes: notes || null,
        creditsRefunded: !refundError,
        oldValues: { status: currentWithdrawal.status },
        newValues: { status: 'rejected', rejection_reason: reason.trim(), processed_at: updateData.processed_at },
      }
    );

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
        if (process.env.NODE_ENV === 'development') {
          console.log('Rejection email sent');
        }
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send rejection email');
      }
    }

    return NextResponse.json(enrichedWithdrawal);
  } catch (error) {
    console.error('Reject withdrawal API error:', error);

    // Log error to audit trail
    await logAdminApiError(
      authResult.context,
      'withdrawal.reject',
      'withdrawal',
      error instanceof Error ? error.message : 'Unknown error'
    );

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
