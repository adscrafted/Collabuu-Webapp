/**
 * Admin Login Hook
 *
 * SECURITY FEATURES:
 * - Separate admin authentication flow
 * - Role verification after authentication
 * - Failed login tracking
 * - Account lockout handling
 * - Audit logging
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  accessToken: string;
  adminUser: {
    id: string;
    email: string;
    role: string;
    adminLevel: string;
  };
}

export interface AdminLoginError {
  message: string;
  code?: string;
  attempts?: number;
  lockedUntil?: string;
}

export function useAdminLogin() {
  const router = useRouter();

  return useMutation<AdminLoginResponse, AdminLoginError, AdminLoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        // Validate environment variables
        if (
          !process.env.NEXT_PUBLIC_SUPABASE_URL ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        ) {
          throw {
            message: 'Authentication service is not configured. Please contact support.',
            code: 'CONFIG_ERROR',
          };
        }

        const supabase = createClient();

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (error) {
          // Handle specific error cases
          let errorMessage = error.message;
          let errorCode = error.status?.toString();

          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';

            // Track failed login attempt via API
            try {
              const response = await fetch('/api/admin/auth/failed-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email }),
              });

              if (response.ok) {
                const failedData = await response.json();
                if (failedData.attempts >= 5) {
                  errorMessage = `Account locked due to multiple failed login attempts. Please try again in 30 minutes.`;
                  errorCode = 'ACCOUNT_LOCKED';
                } else {
                  errorMessage = `Invalid credentials. ${5 - failedData.attempts} attempts remaining before account lock.`;
                }
              }
            } catch (trackError) {
              console.error('Failed to track login attempt:', trackError);
            }
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before signing in.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage =
              'Unable to connect to authentication service. Please check your internet connection.';
          }

          throw {
            message: errorMessage,
            code: errorCode,
          };
        }

        if (!data.session || !data.user) {
          throw {
            message: 'Failed to create session. Please try again.',
            code: 'SESSION_ERROR',
          };
        }

        // Verify admin role and status via API
        try {
          const verifyResponse = await fetch('/api/admin/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          });

          if (!verifyResponse.ok) {
            const errorData = await verifyResponse.json();

            // Sign out if not admin
            await supabase.auth.signOut();

            throw {
              message: errorData.error || 'Access denied. Admin privileges required.',
              code: errorData.code || 'ACCESS_DENIED',
            };
          }

          const adminData = await verifyResponse.json();

          // Update last login timestamp
          await fetch('/api/admin/auth/update-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
          });

          // Log successful admin login
          await fetch('/api/admin/auth/log-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.session.access_token}`,
            },
            body: JSON.stringify({
              action: 'admin.login',
              success: true,
            }),
          });

          return {
            accessToken: data.session.access_token,
            adminUser: {
              id: data.user.id,
              email: data.user.email!,
              role: adminData.role,
              adminLevel: adminData.adminLevel,
            },
          };
        } catch (verifyError: any) {
          // If verify endpoint fails, sign out
          await supabase.auth.signOut();

          if (verifyError.message) {
            throw verifyError;
          }

          throw {
            message: 'Failed to verify admin status. Please try again.',
            code: 'VERIFY_ERROR',
          };
        }
      } catch (error: any) {
        console.error('Admin login error:', error);

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
      // Set admin cookie for middleware
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 1); // Admin sessions expire after 1 day

      document.cookie = `admin_token=${data.accessToken}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict; Secure`;
      document.cookie = `admin_role=${data.adminUser.adminLevel}; path=/; expires=${expiryDate.toUTCString()}; SameSite=Strict; Secure`;

      // Navigate to admin dashboard
      router.push('/admin/withdrawals');
    },
    onError: (error) => {
      console.error('Admin login failed:', error);
    },
  });
}
