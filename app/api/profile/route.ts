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

    // For now, we'll use the user ID as the business ID
    // In a full implementation, you would query a businesses table
    const businessId = user.id;
    const businessName = user.user_metadata?.name || user.email?.split('@')[0] || 'Business';

    return NextResponse.json({
      success: true,
      data: {
        id: businessId,
        businessId: businessId,
        userId: user.id,
        email: user.email,
        businessName: businessName,
        businessType: user.user_metadata?.businessType || 'other',
        phone: user.user_metadata?.phone || '',
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
