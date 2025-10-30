import { NextRequest, NextResponse } from 'next/server';
import { transformKeysToCamelCase } from '@/lib/utils';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateAdmin, logAdminApiAction, logAdminApiError } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';

/**
 * GET /api/admin/withdrawals/[id]
 * Get specific withdrawal request details
 *
 * SECURITY:
 * - Requires admin authentication (viewer level or higher)
 * - Logs all access to audit trail
 * - Rate limited to prevent abuse
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Authenticate admin with viewer level (read-only access)
  const authResult = await authenticateAdmin(request, {
    requiredLevel: AdminLevel.VIEWER,
    action: 'withdrawal.view',
    rateLimitPerMinute: 120, // 120 requests per minute
  });

  if (!authResult.authorized || !authResult.context) {
    // Log unauthorized access attempt
    if (authResult.context) {
      await logAdminApiError(
        authResult.context,
        'withdrawal.view',
        'withdrawal',
        'Unauthorized access attempt'
      );
    }
    return authResult.response!;
  }

  try {
    const { id } = await params;

    // Create Supabase client with service role key
    const supabase = createServiceRoleClient();

    // Fetch withdrawal request with influencer details
    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('withdrawal_requests')
      .select('*, influencer:influencer_id(id, name, email, avatar_url)')
      .eq('id', id)
      .single();

    if (withdrawalError) {
      if (withdrawalError.code === 'PGRST116') {
        // Log not found attempt
        await logAdminApiError(
          authResult.context,
          'withdrawal.view',
          'withdrawal',
          `Withdrawal request not found: ${id}`,
          id
        );

        return NextResponse.json(
          { error: 'Withdrawal request not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching withdrawal:', withdrawalError);

      // Log database error
      await logAdminApiError(
        authResult.context,
        'withdrawal.view',
        'withdrawal',
        `Database error: ${withdrawalError.message}`,
        id
      );

      return NextResponse.json(
        { error: 'Failed to fetch withdrawal request', details: withdrawalError.message },
        { status: 500 }
      );
    }

    // Transform to camelCase and enrich with influencer data
    const transformed = transformKeysToCamelCase(withdrawal);
    const influencerData = withdrawal.influencer;

    const enrichedWithdrawal = {
      ...transformed,
      influencerName: influencerData?.name,
      influencerEmail: influencerData?.email,
      influencerAvatar: influencerData?.avatar_url,
    };

    // Log successful access to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.view',
      'withdrawal',
      id,
      {
        influencerId: withdrawal.influencer_id,
        status: withdrawal.status,
        amount: withdrawal.amount,
      }
    );

    return NextResponse.json(enrichedWithdrawal);
  } catch (error) {
    console.error('Get withdrawal API error:', error);

    // Log error to audit trail
    await logAdminApiError(
      authResult.context,
      'withdrawal.view',
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
