import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/admin/withdrawals/stats
 * Get withdrawal statistics and aggregates
 */
export async function GET(request: NextRequest) {
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

    // Create Supabase client with service role key for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // TODO: Add admin role verification

    // Fetch all withdrawal requests
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawal_requests')
      .select('status, amount');

    if (withdrawalsError) {
      console.error('Error fetching withdrawals for stats:', withdrawalsError);
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

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Admin withdrawal stats API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
