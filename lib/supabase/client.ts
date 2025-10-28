'use client';

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Singleton instance
let supabaseInstance: SupabaseClient | null = null;

/**
 * Creates a singleton Supabase client for browser usage
 * Use this in Client Components and browser contexts
 * Always returns the same instance to prevent multiple GoTrueClient warnings
 */
export function createClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

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
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'collabuu-auth',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      },
    });
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new Error('Failed to initialize authentication service. Please refresh the page.');
  }
}

/**
 * Gets the existing Supabase client instance
 * Creates one if it doesn't exist
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    return createClient();
  }
  return supabaseInstance;
}
