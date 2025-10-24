'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User } from '@/lib/stores/auth-store';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  businessId?: string;
}

export interface LoginError {
  message: string;
  field?: string;
  code?: string;
}

export function useLogin() {
  const router = useRouter();
  const { login: loginAction } = useAuthStore();

  return useMutation<LoginResponse, LoginError, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        // Validate environment variables
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          throw {
            message: 'Authentication service is not configured. Please contact support.',
            code: 'CONFIG_ERROR',
          };
        }

        const supabase = createClient();

        // Sign in with Supabase Auth directly
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          // Handle specific Supabase error messages
          let errorMessage = error.message;

          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before signing in.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Unable to connect to authentication service. Please check your internet connection.';
          }

          throw {
            message: errorMessage,
            code: error.status?.toString(),
          };
        }

        if (!data.session || !data.user) {
          throw {
            message: 'Failed to create session. Please try again.',
            code: 'SESSION_ERROR',
          };
        }

        // Fetch business profile from backend API
        // The access token will be automatically included by the API client
        let businessId: string | undefined;

        try {
          const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/profile`,
            {
              headers: {
                'Authorization': `Bearer ${data.session.access_token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            businessId = profileData.data?.businessId || profileData.data?.id;
          }
        } catch (profileError) {
          // Log but don't fail if profile fetch fails
          console.warn('Failed to fetch business profile:', profileError);
        }

        return {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || data.user.email!.split('@')[0],
            role: data.user.user_metadata?.role || 'business',
          },
          businessId,
        };
      } catch (error: any) {
        console.error('Login error:', error);

        // If error already has a message, re-throw it
        if (error.message) {
          throw error;
        }

        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw {
            message: 'Network error. Please check your internet connection and try again.',
            code: 'NETWORK_ERROR',
          };
        }

        // Generic fallback error
        throw {
          message: 'An unexpected error occurred. Please try again later.',
          code: 'UNKNOWN_ERROR',
        };
      }
    },
    onSuccess: (data) => {
      // Store authentication data
      loginAction(data.accessToken, data.user, data.businessId);

      // Set cookies for middleware (7 days expiry)
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);
      document.cookie = `auth_token=${data.accessToken}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
      if (data.businessId) {
        document.cookie = `business_id=${data.businessId}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Lax`;
      }

      // Navigate to campaigns
      router.push('/campaigns');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}
