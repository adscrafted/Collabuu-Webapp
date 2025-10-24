/**
 * React Query hook for fetching credit balance
 * Matches the backend endpoint at /api/business/credits/balance
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/lib/api/client';

interface CreditBalanceResponse {
  balance: number;
}

interface CreditBalance {
  credits: number;
  businessId?: string;
  lastUpdated?: string;
}

/**
 * Fetch credit balance from backend
 * Backend endpoint: GET /api/business/credits/balance
 * Requires authentication token (businessId from token, not URL)
 */
async function fetchCreditBalance(token?: string | null): Promise<CreditBalance> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const response = await apiClient.get<CreditBalanceResponse>(
      '/api/business/credits/balance',
      {
        timeout: 5000,
      }
    );

    // Transform backend response to match our interface
    return {
      credits: response.data.balance,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching credit balance:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(message);
    }

    throw error;
  }
}

/**
 * React Query hook for credit balance
 * Auto-refreshes every 30 seconds
 */
export function useCreditBalance(token?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['creditBalance', token],
    queryFn: () => fetchCreditBalance(token),
    enabled: options?.enabled !== false && !!token,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Auto-refetch every 60 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 3,
  });
}
