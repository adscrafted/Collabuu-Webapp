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

    // Query credit balance from business_profiles table
    let { data: profile, error: profileError } = await supabase
      .from('business_profiles')
      .select('credits_available')
      .eq('user_id', user.id)
      .single();

    // If profile doesn't exist, create it (same as iOS backend does on first login)
    if (profileError?.code === 'PGRST116') {
      console.log('Business profile not found, creating one...');

      const businessName = user.user_metadata?.name ||
                          user.user_metadata?.businessName ||
                          user.email?.split('@')[0] ||
                          'Business';

      const { error: createError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          business_name: businessName,
          credits: 0,
          credits_available: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (createError) {
        console.error('Error creating business profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create business profile' },
          { status: 500 }
        );
      }

      // Return 0 balance for newly created profile
      return NextResponse.json({
        balance: 0,
      });
    }

    if (profileError) {
      console.error('Error fetching credits:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch credit balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: profile?.credits_available ?? 0,
    });
  } catch (error) {
    console.error('Credit balance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
