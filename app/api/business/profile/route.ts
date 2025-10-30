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

    const { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching business profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch business profile' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({
        id: user.id,
        userId: user.id,
        business_name: user.user_metadata?.name,
        email: user.email || '',
        phone: '',
        phoneNumber: '',
        website: null,
        streetAddress: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        availableCredits: 0,
        logoUrl: null,
        imageUrls: [],
        isVerified: false,
        socialMediaHandles: null,
        needsOnboarding: true,
        createdAt: user.created_at,
        updatedAt: user.created_at,
      });
    }

    // Profile data retrieved successfully

    // Calculate current credit balance from transaction history (source of truth)
    const businessId = user.id;
    const allTransactions: any[] = [];

    // 1. Fetch credit additions (purchases)
    const { data: additions } = await supabase
      .from('credit_transactions')
      .select('credits, amount, created_at')
      .eq('business_id', businessId)
      .in('transaction_type', ['purchase'])
      .eq('status', 'completed');

    if (additions) {
      additions.forEach((txn: any) => {
        allTransactions.push({
          amount: txn.credits ?? txn.amount, // Use credits field (actual credits purchased) not amount field (price paid). Use ?? to handle 0 credits correctly (|| would incorrectly fall back to amount)
          created_at: txn.created_at,
        });
      });
    }

    // 2. Fetch campaigns for reference
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, total_credits, created_at')
      .eq('business_id', businessId);

    // 3. Fetch campaign_create transactions
    const { data: campaignTransactions } = await supabase
      .from('credit_transactions')
      .select('amount, created_at, related_id')
      .eq('business_id', businessId)
      .eq('transaction_type', 'campaign_create')
      .eq('status', 'completed');

    // Track which campaigns have transaction records
    const campaignsWithTransactions = new Set<string>();
    if (campaignTransactions) {
      campaignTransactions.forEach((txn: any) => {
        allTransactions.push(txn);
        if (txn.related_id) {
          campaignsWithTransactions.add(txn.related_id);
        }
      });
    }

    // 4. Add campaign deductions for older campaigns without transaction records
    if (campaigns) {
      campaigns.forEach((campaign: any) => {
        // Only add if this campaign doesn't already have a transaction record
        if (!campaignsWithTransactions.has(campaign.id) && campaign.total_credits && campaign.total_credits > 0) {
          allTransactions.push({
            amount: -Math.abs(campaign.total_credits),
            created_at: campaign.created_at,
          });
        }
      });
    }

    // 5. Fetch refunds
    const campaignIds = campaigns ? campaigns.map((c: any) => c.id) : [];
    if (campaignIds.length > 0) {
      const { data: refunds } = await supabase
        .from('credit_transactions')
        .select('amount, created_at')
        .eq('business_id', businessId)
        .eq('transaction_type', 'refund')
        .eq('related_table', 'campaigns')
        .in('related_id', campaignIds);

      if (refunds) {
        refunds.forEach((txn: any) => allTransactions.push(txn));
      }
    }

    // Calculate balance
    let calculatedBalance = 0;
    allTransactions.forEach((txn) => {
      calculatedBalance += txn.amount;
    });

    // Build social media handles from individual columns (database stores them separately)
    const socialMediaHandles = {
      instagram: profile.instagram_handle || null,
      tiktok: profile.tiktok_handle || null,
      youtube: profile.youtube_channel || null,
      facebook: profile.facebook_page || null,
      twitter: profile.twitter_handle || null,
      linkedin: profile.linkedin_company || null,
    };

    // Transform snake_case database columns to match expected format
    const transformedProfile = {
      id: profile.id,
      userId: profile.user_id,
      business_name: profile.business_name,
      email: user.email, // Get email from auth user
      phone: profile.phone || profile.phone_number || '',
      phoneNumber: profile.phone_number || profile.phone || '',
      website: profile.website,
      streetAddress: profile.street_address,
      address: profile.address || profile.street_address,
      city: profile.city,
      state: profile.state,
      postalCode: profile.postal_code,
      country: profile.country,
      availableCredits: calculatedBalance, // Use calculated balance from transaction history
      logoUrl: profile.logo_url || profile.profile_image_url || profile.image_urls?.[0],
      imageUrls: profile.image_urls || [],
      isVerified: profile.is_verified || false,
      socialMediaHandles: socialMediaHandles,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Business profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();

    // Support both camelCase (from web) and snake_case (from iOS) field names
    const businessName = body.business_name || body.businessName;
    const streetAddress = body.street_address || body.streetAddress;
    const postalCode = body.postal_code || body.postalCode;

    // Only include fields that actually exist in the database schema
    const updateData: any = {
      business_name: businessName,
      phone_number: body.phone,  // Database uses phone_number, not phone
      website: body.website,
      street_address: streetAddress,
      city: body.city,
      state: body.state,
      postal_code: postalCode,
      country: body.country,
      updated_at: new Date().toISOString(),
    };

    // Handle social media handles - support both iOS nested format and Web flat format
    // iOS sends: socialMediaHandles: { instagram: "...", facebook: "..." }
    // Web sends: instagram_handle, facebook_page, etc.
    const socialMedia = body.socialMediaHandles || {};

    updateData.instagram_handle = body.instagram_handle || socialMedia.instagram || null;
    updateData.tiktok_handle = body.tiktok_handle || socialMedia.tiktok || null;
    updateData.youtube_channel = body.youtube_channel || socialMedia.youtube || null;
    updateData.facebook_page = body.facebook_page || socialMedia.facebook || null;
    updateData.twitter_handle = body.twitter_handle || socialMedia.twitter || null;
    updateData.linkedin_company = body.linkedin_company || socialMedia.linkedin || null;

    // DEBUG: Log what we're about to insert
    console.log('Upserting business profile with data:', {
      user_id: user.id,
      updateData,
      receivedBody: body,
    });

    const { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .upsert({
        user_id: user.id,
        ...updateData,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error updating business profile:', {
        error: profileError,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
      });
      return NextResponse.json({
        error: 'Failed to update business profile',
        details: profileError.message
      }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Business profile update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
