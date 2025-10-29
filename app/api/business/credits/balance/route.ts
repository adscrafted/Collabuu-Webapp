import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // Create Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const businessId = user.id;

    // Calculate balance from transaction history (source of truth)
    const allTransactions: any[] = [];

    // 1. Fetch credit additions (purchases)
    const { data: additions } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('business_id', businessId)
      .in('transaction_type', ['purchase'])
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (additions) {
      additions.forEach((addition: any) => {
        allTransactions.push({
          amount: addition.credits ?? addition.amount, // Use credits field (actual credits purchased) not amount field (price paid). Use ?? to handle 0 credits correctly (|| would incorrectly fall back to amount)
          created_at: addition.created_at,
        });
      });
    }

    // 2. Fetch campaigns to calculate deductions
    // Note: We deduct the full campaign budget when created (reserves credits)
    // Individual QR redemptions are not separate transactions - they're covered by the campaign budget
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, total_credits, created_at')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (campaigns) {
      for (const campaign of campaigns) {
        if (campaign.total_credits && campaign.total_credits > 0) {
          allTransactions.push({
            amount: -Math.abs(campaign.total_credits),
            created_at: campaign.created_at,
          });
        }
      }
    }

    // 3. Fetch refunds
    const campaignIds = campaigns ? campaigns.map((c: any) => c.id) : [];
    if (campaignIds.length > 0) {
      const { data: refunds } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('business_id', businessId) // SECURITY: Explicit user isolation
        .eq('transaction_type', 'refund')
        .eq('related_table', 'campaigns')
        .in('related_id', campaignIds)
        .order('created_at', { ascending: false });

      if (refunds) {
        refunds.forEach((refund: any) => {
          allTransactions.push({
            amount: refund.amount,
            created_at: refund.created_at,
          });
        });
      }
    }

    // Calculate running balance
    let balance = 0;
    allTransactions.forEach((transaction) => {
      balance += transaction.amount;
    });

    return NextResponse.json({
      balance,
    });
  } catch (error) {
    console.error('Credit balance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
