'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { User } from '@/lib/stores/auth-store';

export interface RegisterData {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  businessType: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  businessId: string;
}

export interface RegisterError {
  message: string;
  field?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

export function useRegister() {
  const router = useRouter();
  const { login: loginAction } = useAuthStore();

  return useMutation<RegisterResponse, RegisterError, RegisterData>({
    mutationFn: async (data) => {
      try {
        const supabase = createClient();

        // Step 1: Create auth user with Supabase Auth directly
        const { data: authData, error: authError } = await supabase!.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.businessName,
              role: 'business',
              businessType: data.businessType,
              phone: data.phone,
            },
          },
        });

        if (authError) {
          throw {
            message: authError.message || 'Failed to create account',
            code: authError.status?.toString(),
          };
        }

        if (!authData.user) {
          throw {
            message: 'Failed to create user account',
          };
        }

        // Step 2: Create business profile in database via backend API (if available)
        if (authData.session) {
          try {
            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/business/profile`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${authData.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  businessName: data.businessName,
                  businessType: data.businessType,
                  phone: data.phone,
                  email: data.email,
                }),
              }
            );
          } catch (profileError) {
            console.warn('Could not create business profile:', profileError);
            // Continue anyway - profile can be created later
          }
        }

        // Check if email confirmation is required
        if (!authData.session) {
          throw {
            message: 'Please check your email to confirm your account',
            code: 'EMAIL_CONFIRMATION_REQUIRED',
          };
        }

        return {
          accessToken: authData.session.access_token,
          refreshToken: authData.session.refresh_token,
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            name: data.businessName,
            role: 'business',
          },
          businessId: authData.user.id,
        };
      } catch (error: any) {
        console.error('Registration error:', error);

        if (error.message) {
          throw error;
        }

        throw {
          message: 'Failed to create account. Please try again.',
        };
      }
    },
    onSuccess: (data) => {
      // Store authentication data
      loginAction(data.accessToken, data.user, data.businessId);

      // Navigate to campaigns page
      router.push('/campaigns');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
}
