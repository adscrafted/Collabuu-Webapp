'use client';

import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export interface ForgotPasswordCredentials {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ForgotPasswordError {
  message: string;
  code?: string;
}

export function useForgotPassword() {
  return useMutation<
    ForgotPasswordResponse,
    ForgotPasswordError,
    ForgotPasswordCredentials
  >({
    mutationFn: async (credentials) => {
      try {
        const supabase = createClient();

        // Send password reset email using Supabase Auth
        const { error } = await supabase!.auth.resetPasswordForEmail(
          credentials.email,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

        if (error) {
          throw {
            message: error.message || 'Failed to send password reset email',
            code: error.status?.toString(),
          };
        }

        return {
          message: 'Password reset instructions have been sent to your email',
        };
      } catch (error: any) {
        console.error('Forgot password error:', error);

        if (error.message) {
          throw error;
        }

        throw {
          message: 'Network error. Please check your connection.',
        };
      }
    },
  });
}
