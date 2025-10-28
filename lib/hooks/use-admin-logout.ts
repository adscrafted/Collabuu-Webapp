/**
 * Admin Logout Hook
 *
 * SECURITY:
 * - Logs logout action to audit trail
 * - Clears all admin session data
 * - Invalidates Supabase session
 */

'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function useAdminLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {
        const supabase = createClient();

        // Get current session token for API call
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          // Call logout API to log the action
          try {
            await fetch('/api/admin/auth/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
            });
          } catch (error) {
            console.error('Failed to log logout action:', error);
            // Continue with logout even if logging fails
          }
        }

        // Sign out from Supabase
        await supabase.auth.signOut();

        // Clear admin cookies
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
        document.cookie = 'admin_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';

        return { success: true };
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Redirect to admin login page
      router.push('/admin/login');
    },
    onError: (error) => {
      console.error('Admin logout failed:', error);
      // Still redirect to login even on error
      router.push('/admin/login');
    },
  });
}
