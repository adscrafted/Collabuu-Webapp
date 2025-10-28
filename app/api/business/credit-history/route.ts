import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const businessId = user.id;
    const allTransactions: any[] = [];

    // 1. Fetch credit additions (purchases) from credit_transactions table
    const { data: additions, error: additionsError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('business_id', businessId)
      .in('transaction_type', ['purchase'])
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (additionsError) {
      console.error('Error fetching credit additions:', additionsError);
    }

    // Add purchases to transactions list
    if (additions) {
      additions.forEach((addition: any) => {
        allTransactions.push({
          id: `addition_${addition.id}`,
          business_id: businessId,
          amount: addition.amount,
          type: 'purchase',
          description: addition.description || 'Credit Purchase',
          campaign_id: null,
          campaign_name: null,
          created_at: addition.created_at,
        });
      });
    }

    // 2. Fetch campaigns to create campaign_create transactions
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, total_credits, created_at, credits_per_action, status')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError);
    }

    // Add campaign creation transactions
    if (campaigns) {
      for (const campaign of campaigns) {
        if (campaign.total_credits && campaign.total_credits > 0) {
          allTransactions.push({
            id: `campaign_create_${campaign.id}`,
            business_id: businessId,
            amount: -Math.abs(campaign.total_credits), // Negative amount for deduction
            type: 'campaignCreate',
            description: `Campaign: ${campaign.title}`,
            campaign_id: campaign.id,
            campaign_name: campaign.title,
            created_at: campaign.created_at,
          });
        }

        // Fetch QR code redemptions for this campaign
        const { data: redemptions } = await supabase
          .from('qr_code_redemptions')
          .select('*')
          .eq('campaign_id', campaign.id)
          .eq('status', 'completed');

        if (redemptions) {
          redemptions.forEach((redemption: any) => {
            if (redemption.credits_earned && redemption.credits_earned > 0) {
              allTransactions.push({
                id: `redemption_${redemption.id}`,
                business_id: businessId,
                amount: -Math.abs(redemption.credits_earned),
                type: 'campaignCreate',
                description: `Credits transferred to influencer for ${campaign.title}`,
                campaign_id: campaign.id,
                campaign_name: campaign.title,
                created_at: redemption.redeemed_at || redemption.created_at,
              });
            }
          });
        }
      }
    }

    // 3. Fetch refunds from credit_transactions table
    const campaignIds = campaigns ? campaigns.map((c: any) => c.id) : [];
    if (campaignIds.length > 0) {
      const { data: refunds } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('transaction_type', 'refund')
        .eq('related_table', 'campaigns')
        .in('related_id', campaignIds)
        .order('created_at', { ascending: false });

      if (refunds) {
        refunds.forEach((refund: any) => {
          allTransactions.push({
            id: `refund_${refund.id}`,
            business_id: businessId,
            amount: refund.amount,
            type: 'refund',
            description: refund.description || 'Credit Refund',
            campaign_id: refund.related_id,
            campaign_name: campaigns?.find((c: any) => c.id === refund.related_id)?.title,
            created_at: refund.created_at,
          });
        });
      }
    }

    // Sort transactions by date (oldest first) for balance calculation
    allTransactions.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Calculate balance after each transaction
    let runningBalance = 0;
    allTransactions.forEach((transaction) => {
      const amount = transaction.amount;
      if (amount > 0) {
        // Addition: purchase, refund, bonus
        runningBalance += amount;
      } else {
        // Deduction: campaign_create, campaign_boost
        runningBalance += amount; // amount is already negative
      }
      transaction.balance_after = runningBalance;
    });

    // Sort transactions by newest first for display
    allTransactions.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Use the running balance calculated from transaction history as the source of truth
    // This ensures the current balance always matches the latest transaction's balance_after
    const currentBalance = runningBalance;

    // Transform to camelCase for frontend
    const formattedTransactions = allTransactions.map((transaction: any) => ({
      id: transaction.id,
      businessId: transaction.business_id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      campaignId: transaction.campaign_id,
      campaignName: transaction.campaign_name,
      createdAt: transaction.created_at,
      balanceAfter: transaction.balance_after,
    }));

    return NextResponse.json({
      transactions: formattedTransactions,
      currentBalance,
    });
  } catch (error) {
    console.error('Credit history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
