import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateAdmin, logAdminApiAction, logAdminApiError } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';

/**
 * GET /api/admin/withdrawals/stats
 * Get withdrawal statistics and aggregates
 *
 * SECURITY:
 * - Requires admin authentication (viewer level or higher)
 * - Logs all access to audit trail
 * - Rate limited to prevent abuse
 */
export async function GET(request: NextRequest) {
  // Authenticate admin with viewer level (read-only access)
  const authResult = await authenticateAdmin(request, {
    requiredLevel: AdminLevel.VIEWER,
    action: 'withdrawal.stats',
    rateLimitPerMinute: 60, // 60 requests per minute
  });

  if (!authResult.authorized || !authResult.context) {
    // Log unauthorized access attempt
    if (authResult.context) {
      await logAdminApiError(
        authResult.context,
        'withdrawal.stats',
        'withdrawal',
        'Unauthorized access attempt'
      );
    }
    return authResult.response!;
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createServiceRoleClient();

    // Fetch all withdrawal requests
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('status, amount');

    if (withdrawalsError) {
      console.error('Error fetching withdrawals for stats:', withdrawalsError);

      // Log error to audit trail
      await logAdminApiError(
        authResult.context,
        'withdrawal.stats',
        'withdrawal',
        `Database error: ${withdrawalsError.message}`
      );

      return NextResponse.json(
        { error: 'Failed to fetch withdrawal statistics', details: withdrawalsError.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      totalPending: 0,
      totalApproved: 0,
      totalProcessing: 0,
      totalCompleted: 0,
      totalRejected: 0,
      totalPendingAmount: 0,
      totalProcessedAmount: 0,
    };

    withdrawals?.forEach((withdrawal) => {
      switch (withdrawal.status) {
        case 'pending':
          stats.totalPending++;
          stats.totalPendingAmount += withdrawal.amount;
          break;
        case 'approved':
          stats.totalApproved++;
          break;
        case 'processing':
          stats.totalProcessing++;
          break;
        case 'completed':
          stats.totalCompleted++;
          stats.totalProcessedAmount += withdrawal.amount;
          break;
        case 'rejected':
          stats.totalRejected++;
          break;
      }
    });

    // Log successful access to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.stats',
      'withdrawal',
      undefined,
      { resultCount: withdrawals?.length || 0 }
    );

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin withdrawal stats API error:', error);

    // Log error to audit trail
    await logAdminApiError(
      authResult.context,
      'withdrawal.stats',
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
