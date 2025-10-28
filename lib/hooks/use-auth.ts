'use client';

import { useEffect, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export function useAuth() {
  const router = useRouter();
  // Use the singleton instance instead of creating a new one
  const supabase = useMemo(() => getSupabaseClient(), []);

  const {
    user,
    token,
    businessId,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    setBusinessId,
    setLoading,
    login,
    logout: logoutAction,
    refreshToken,
    updateUser,
  } = useAuthStore();

  // Listen to Supabase auth state changes
  useEffect(() => {
    let subscription: any;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error);
        // Clear invalid session
        logoutAction();
        return;
      }

      if (session) {
        // Preserve existing user data if available (from persisted store or previous login)
        const existingUser = user;
        login(
          session.access_token,
          {
            id: session.user.id,
            email: session.user.email!,
            // Preserve business name/avatar/phone if already set
            name: existingUser?.name || existingUser?.businessName || session.user.user_metadata?.name || session.user.email!.split('@')[0],
            businessName: existingUser?.businessName,
            role: session.user.user_metadata?.role || 'business',
            avatar: existingUser?.avatar,
            phone: existingUser?.phone,
          },
          session.user.id
        );
      }
    }).catch((error) => {
      console.error('Failed to get session:', error);
      logoutAction();
    });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle token refresh errors
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('Token refresh failed, clearing session');
        logoutAction();
        return;
      }

      if (event === 'SIGNED_OUT') {
        logoutAction();
        return;
      }

      if (session) {
        // Preserve existing user data if available (from persisted store or previous login)
        const existingUser = user;
        login(
          session.access_token,
          {
            id: session.user.id,
            email: session.user.email!,
            // Preserve business name/avatar/phone if already set
            name: existingUser?.name || existingUser?.businessName || session.user.user_metadata?.name || session.user.email!.split('@')[0],
            businessName: existingUser?.businessName,
            role: session.user.user_metadata?.role || 'business',
            avatar: existingUser?.avatar,
            phone: existingUser?.phone,
          },
          session.user.id
        );
      } else if (event !== 'INITIAL_SESSION') {
        // Only logout if it's not the initial session check (which might not have a session)
        logoutAction();
      }
    });

    subscription = data.subscription;

    return () => {
      subscription?.unsubscribe();
    };
    // Only run once on mount - login/logoutAction are stable zustand actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Token refresh is handled automatically by Supabase
  // The onAuthStateChange listener above will update the token when Supabase refreshes it

  // Enhanced logout with navigation
  const logout = useCallback(async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local state
    logoutAction();

    // Clear cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'business_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }

    // Redirect to login
    router.push('/login');
  }, [logoutAction, router, supabase]);

  // Check if user has required role
  const hasRole = useCallback(
    (role: 'business' | 'influencer') => {
      return user?.role === role;
    },
    [user]
  );

  // Check if user belongs to a business
  const hasBusiness = useCallback(() => {
    return !!businessId || !!user?.businessId;
  }, [businessId, user]);

  return {
    // State
    user,
    token,
    businessId,
    isAuthenticated,
    isLoading,

    // Actions
    setUser,
    setToken,
    setBusinessId,
    setLoading,
    login,
    logout,
    refreshToken,
    updateUser,

    // Helper functions
    hasRole,
    hasBusiness,
  };
}
