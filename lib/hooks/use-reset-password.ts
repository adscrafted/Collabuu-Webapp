'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export interface ResetPasswordCredentials {
  password: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface ResetPasswordError {
  message: string;
  code?: string;
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation<
    ResetPasswordResponse,
    ResetPasswordError,
    ResetPasswordCredentials
  >({
    mutationFn: async (credentials) => {
      try {
        const supabase = createClient();

        // Update the user's password using Supabase Auth
        const { error } = await supabase!.auth.updateUser({
          password: credentials.password,
        });

        if (error) {
          throw {
            message: error.message || 'Failed to reset password',
            code: error.status?.toString(),
          };
        }

        return {
          message: 'Password has been reset successfully',
        };
      } catch (error: any) {
        console.error('Reset password error:', error);

        if (error.message) {
          throw error;
        }

        throw {
          message: 'Network error. Please check your connection.',
        };
      }
    },
    onSuccess: () => {
      // Redirect to login page after successful password reset
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
  });
}
