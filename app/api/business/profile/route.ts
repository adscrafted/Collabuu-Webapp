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
        business_name: user.user_metadata?.name || '',
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

    // Log raw database data for debugging
    console.log('Raw profile from DB:', JSON.stringify(profile, null, 2));

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
      availableCredits: profile.available_credits || profile.credits_available || 0,
      logoUrl: profile.logo_url || profile.profile_image_url || profile.image_urls?.[0],
      imageUrls: profile.image_urls || [],
      isVerified: profile.is_verified || false,
      socialMediaHandles: socialMediaHandles,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    console.log('Transformed profile:', JSON.stringify(transformedProfile, null, 2));
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

    const updateData: any = {
      business_name: body.business_name,
      phone: body.phone,
      phone_number: body.phone,
      email: body.email,
      website: body.website,
      street_address: body.street_address,
      address: body.street_address,
      city: body.city,
      state: body.state,
      postal_code: body.postal_code,
      country: body.country,
      updated_at: new Date().toISOString(),
    };

    if (body.instagram_handle || body.tiktok_handle || body.youtube_channel ||
        body.facebook_page || body.twitter_handle || body.linkedin_company) {
      updateData.social_media_handles = {
        instagram: body.instagram_handle || null,
        tiktok: body.tiktok_handle || null,
        youtube: body.youtube_channel || null,
        facebook: body.facebook_page || null,
        twitter: body.twitter_handle || null,
        linkedin: body.linkedin_company || null,
      };
    }

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
      console.error('Error updating business profile:', profileError);
      return NextResponse.json({ error: 'Failed to update business profile' }, { status: 500 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Business profile update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
