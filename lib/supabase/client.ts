'use client';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for browser usage
 * Use this in Client Components and browser contexts
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  try {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'collabuu-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new Error('Failed to initialize authentication service. Please refresh the page.');
  }
}
