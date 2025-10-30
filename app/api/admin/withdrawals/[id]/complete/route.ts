import { NextRequest, NextResponse } from 'next/server';
import { transformKeysToCamelCase } from '@/lib/utils';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateAdmin, logAdminApiAction, logAdminApiError } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';
import { sendEmail } from '@/lib/email/service';
import { WithdrawalCompletedEmail } from '@/lib/email/templates';

/**
 * PATCH /api/admin/withdrawals/[id]/complete
 * Mark withdrawal as completed with transaction ID
 *
 * SECURITY:
 * - Requires admin authentication (moderator level or higher)
 * - Logs all completion actions to audit trail with transaction IDs
 * - Rate limited to prevent abuse
 * - Tracks admin who completed the withdrawal and transaction ID
 *
 * Request body:
 * {
 *   transactionId: string (required)
 *   notes?: string
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate admin with moderator level (can complete withdrawals)
  const authResult = await authenticateAdmin(request, {
    requiredLevel: AdminLevel.MODERATOR,
    action: 'withdrawal.complete',
    rateLimitPerMinute: 30, // 30 completions per minute max
  });

  if (!authResult.authorized || !authResult.context) {
    // Log unauthorized access attempt
    if (authResult.context) {
      await logAdminApiError(
        authResult.context,
        'withdrawal.complete',
        'withdrawal',
        'Unauthorized completion attempt'
      );
    }
    return authResult.response!;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { transactionId, notes } = body;

    // Validate required fields
    if (!transactionId || typeof transactionId !== 'string' || transactionId.trim() === '') {
      // Log validation error
      await logAdminApiError(
        authResult.context,
        'withdrawal.complete',
        'withdrawal',
        'Missing transaction ID',
        id
      );

      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createServiceRoleClient();

    // First, fetch the current withdrawal to verify it exists and check status
    const { data: currentWithdrawal, error: fetchError } = await supabase
      .from('withdrawal_requests')
      .select('status, influencer_id, amount, credits')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Log not found error
        await logAdminApiError(
          authResult.context,
          'withdrawal.complete',
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
        'withdrawal.complete',
        'withdrawal',
        `Database error: ${fetchError.message}`,
        id
      );

      return NextResponse.json(
        { error: 'Failed to fetch withdrawal request', details: fetchError.message },
        { status: 500 }
      );
    }

    // Verify the withdrawal is in approved or processing status
    if (!['approved', 'processing'].includes(currentWithdrawal.status)) {
      // Log invalid state transition attempt
      await logAdminApiError(
        authResult.context,
        'withdrawal.complete',
        'withdrawal',
        `Invalid status transition: Cannot complete withdrawal with status ${currentWithdrawal.status}`,
        id
      );

      return NextResponse.json(
        { error: `Cannot complete withdrawal with status: ${currentWithdrawal.status}. Must be approved or processing.` },
        { status: 400 }
      );
    }

    // Update withdrawal status to completed
    const updateData: any = {
      status: 'completed',
      transaction_id: transactionId.trim(),
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
      console.error('Error completing withdrawal:', updateError);

      // Log update error
      await logAdminApiError(
        authResult.context,
        'withdrawal.complete',
        'withdrawal',
        `Failed to update withdrawal: ${updateError.message}`,
        id
      );

      return NextResponse.json(
        { error: 'Failed to complete withdrawal request', details: updateError.message },
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

    // Log successful completion to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.complete',
      'withdrawal',
      id,
      {
        influencerId: currentWithdrawal.influencer_id,
        amount: currentWithdrawal.amount,
        credits: currentWithdrawal.credits,
        transactionId: transactionId.trim(),
        notes: notes || null,
        oldValues: { status: currentWithdrawal.status },
        newValues: { status: 'completed', transaction_id: transactionId.trim(), processed_at: updateData.processed_at },
      }
    );

    // Send email notification to influencer about completion
    if (influencerData?.email) {
      try {
        await sendEmail({
          to: influencerData.email,
          subject: 'Payment Sent! - E-Transfer on Its Way',
          react: WithdrawalCompletedEmail({
            influencerName: influencerData.name || 'Influencer',
            amount: updatedWithdrawal.amount,
            credits: updatedWithdrawal.credits,
            requestedAt: updatedWithdrawal.requested_at,
            completedAt: updatedWithdrawal.processed_at || new Date().toISOString(),
            transactionId: updatedWithdrawal.transaction_id,
            etransferEmail: updatedWithdrawal.etransfer_email,
          }),
        });
        if (process.env.NODE_ENV === 'development') {
          console.log('Completion email sent');
        }
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send completion email');
      }
    }

    return NextResponse.json(enrichedWithdrawal);
  } catch (error) {
    console.error('Complete withdrawal API error:', error);

    // Log error to audit trail
    await logAdminApiError(
      authResult.context,
      'withdrawal.complete',
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
