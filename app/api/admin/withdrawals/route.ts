import { NextRequest, NextResponse } from 'next/server';
import { transformKeysToCamelCase } from '@/lib/utils';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { authenticateAdmin, logAdminApiAction } from '@/lib/auth/admin-middleware';
import { AdminLevel } from '@/lib/auth/admin';

/**
 * GET /api/admin/withdrawals
 * List all withdrawal requests with filtering
 *
 * SECURITY:
 * - Requires admin authentication (viewer level or higher)
 * - Logs all access to audit trail
 * - Rate limited to prevent abuse
 *
 * Query Parameters:
 * - status: Filter by status (comma-separated for multiple)
 * - startDate: Filter by requested_at >= startDate (ISO string)
 * - endDate: Filter by requested_at <= endDate (ISO string)
 * - influencerId: Filter by specific influencer
 * - minAmount: Minimum amount filter
 * - maxAmount: Maximum amount filter
 * - sortBy: Sort order (newest, oldest, amount_high, amount_low)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 20)
 */
export async function GET(request: NextRequest) {
  // Authenticate admin with viewer level (read-only access)
  const authResult = await authenticateAdmin(request, {
    requiredLevel: AdminLevel.VIEWER,
    action: 'withdrawal.list',
    rateLimitPerMinute: 60, // 60 requests per minute
  });

  if (!authResult.authorized || !authResult.context) {
    return authResult.response!;
  }

  const { adminUser, ipAddress, userAgent } = authResult.context;

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createServiceRoleClient();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const influencerId = searchParams.get('influencerId');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let query = supabase
      .from('withdrawal_requests')
      .select('*, influencer:influencer_id(id, name, email, avatar_url)', { count: 'exact' });

    // Apply filters
    if (status && status !== 'all') {
      const statuses = status.split(',');
      query = query.in('status', statuses);
    }

    if (startDate) {
      query = query.gte('requested_at', startDate);
    }

    if (endDate) {
      query = query.lte('requested_at', endDate);
    }

    if (influencerId) {
      query = query.eq('influencer_id', influencerId);
    }

    if (minAmount) {
      query = query.gte('amount', parseFloat(minAmount));
    }

    if (maxAmount) {
      query = query.lte('amount', parseFloat(maxAmount));
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('requested_at', { ascending: true });
        break;
      case 'amount_high':
        query = query.order('amount', { ascending: false });
        break;
      case 'amount_low':
        query = query.order('amount', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('requested_at', { ascending: false });
        break;
    }

    // Apply pagination
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    query = query.range(start, end);

    // Execute query
    const { data: withdrawals, error: withdrawalsError, count } = await query;

    if (withdrawalsError) {
      console.error('Error fetching withdrawals:', withdrawalsError);
      return NextResponse.json(
        { error: 'Failed to fetch withdrawal requests', details: withdrawalsError.message },
        { status: 500 }
      );
    }

    // Calculate aggregate stats
    const statsQuery = supabase
      .from('withdrawal_requests')
      .select('status, amount');

    const { data: allWithdrawals } = await statsQuery;

    let totalPendingAmount = 0;
    let totalProcessedAmount = 0;

    allWithdrawals?.forEach((w) => {
      if (w.status === 'pending') {
        totalPendingAmount += w.amount;
      } else if (w.status === 'completed') {
        totalProcessedAmount += w.amount;
      }
    });

    // Transform snake_case to camelCase and enrich with influencer data
    const transformedWithdrawals = (withdrawals || []).map((withdrawal: any) => {
      const transformed = transformKeysToCamelCase(withdrawal);

      // Extract influencer data from the joined table
      const influencerData = withdrawal.influencer;

      return {
        ...transformed,
        influencerName: influencerData?.name,
        influencerEmail: influencerData?.email,
        influencerAvatar: influencerData?.avatar_url,
      };
    });

    // Calculate total pages
    const totalPages = count ? Math.ceil(count / limit) : 0;

    // Log successful access to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.list',
      'withdrawal',
      undefined,
      {
        filters: { status, startDate, endDate, influencerId, minAmount, maxAmount },
        resultCount: count || 0,
        page,
      }
    );

    return NextResponse.json({
      withdrawals: transformedWithdrawals,
      total: count || 0,
      page,
      limit,
      totalPages,
      totalPendingAmount,
      totalProcessedAmount,
    });
  } catch (error) {
    console.error('Admin withdrawals API error:', error);

    // Log error to audit trail
    await logAdminApiAction(
      authResult.context,
      'withdrawal.list',
      'withdrawal',
      undefined,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      }
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
