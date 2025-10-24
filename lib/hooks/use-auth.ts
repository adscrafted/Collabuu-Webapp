'use client';

import { useEffect, useCallback, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useAuth() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        login(
          session.access_token,
          {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            role: session.user.user_metadata?.role || 'business',
          },
          session.user.id
        );
      }
    });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        login(
          session.access_token,
          {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            role: session.user.user_metadata?.role || 'business',
          },
          session.user.id
        );
      } else {
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

  // Set up token refresh interval (every 15 minutes)
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    const interval = setInterval(
      () => {
        refreshToken().catch((error) => {
          console.error('Failed to refresh token:', error);
        });
      },
      15 * 60 * 1000
    ); // 15 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, token, refreshToken]);

  // Enhanced logout with navigation
  const logout = useCallback(async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();

    // Clear local state
    logoutAction();

    // Redirect to login
    router.push('/login');
  }, [logoutAction, router]);

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
