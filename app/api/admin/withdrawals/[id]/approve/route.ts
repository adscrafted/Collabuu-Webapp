import { NextRequest, NextResponse } from 'next/server';
import { transformKeysToCamelCase } from '@/lib/utils';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateAdmin, logAdminApiAction, logAdminApiError } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';
import { sendEmail } from '@/lib/email/service';
import { WithdrawalApprovedEmail } from '@/lib/email/templates';

/**
 * PATCH /api/admin/withdrawals/[id]/approve
 * Approve a withdrawal request
 *
 * SECURITY:
 * - Requires admin authentication (moderator level or higher)
 * - Logs all approval actions to audit trail with old/new values
 * - Rate limited to prevent abuse
 * - Tracks admin who approved the withdrawal
 *
 * Request body:
 * {
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
    action: 'withdrawal.approve',
    rateLimitPerMinute: 30, // 30 approvals per minute max
  });

  if (!authResult.authorized || !authResult.context) {
    // Log unauthorized access attempt
    if (authResult.context) {
      await logAdminApiError(
        authResult.context,
        'withdrawal.approve',
        'withdrawal',
        'Unauthorized approval attempt'
      );
    }
    return authResult.response!;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { notes } = body;

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
          'withdrawal.approve',
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
        'withdrawal.approve',
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
        'withdrawal.approve',
        'withdrawal',
        `Invalid status transition: Cannot approve withdrawal with status ${currentWithdrawal.status}`,
        id
      );

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

      // Log update error
      await logAdminApiError(
        authResult.context,
        'withdrawal.approve',
        'withdrawal',
        `Failed to update withdrawal: ${updateError.message}`,
        id
      );

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

    // Log successful approval to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.approve',
      'withdrawal',
      id,
      {
        influencerId: currentWithdrawal.influencer_id,
        amount: currentWithdrawal.amount,
        credits: currentWithdrawal.credits,
        notes: notes || null,
        oldValues: { status: currentWithdrawal.status },
        newValues: { status: 'approved', processed_at: updateData.processed_at },
      }
    );

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
        if (process.env.NODE_ENV === 'development') {
          console.log('Approval email sent');
        }
      } catch (emailError) {
        // Log error but don't fail the request
        console.error('Failed to send approval email');
      }
    }

    return NextResponse.json(enrichedWithdrawal);
  } catch (error) {
    console.error('Approve withdrawal API error:', error);

    // Log error to audit trail
    await logAdminApiError(
      authResult.context,
      'withdrawal.approve',
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
