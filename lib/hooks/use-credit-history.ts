/**
 * React Query hook for fetching credit history
 * Matches the backend endpoint at /api/business/credit-history
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/lib/api/client';
import { CreditHistoryResponse } from '@/lib/types/credit-history';

/**
 * Fetch credit history from backend
 * Backend endpoint: GET /api/business/credit-history
 * Requires authentication token
 */
async function fetchCreditHistory(token?: string | null): Promise<CreditHistoryResponse> {
  try {
    if (!token) {
      throw new Error('Authentication token required');
    }

    const response = await apiClient.get<CreditHistoryResponse>(
      '/api/business/credit-history',
      {
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching credit history:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(message);
    }

    throw error;
  }
}

/**
 * React Query hook for credit history
 * Data is considered fresh for 5 minutes
 */
export function useCreditHistory(token?: string | null, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['creditHistory', token],
    queryFn: () => fetchCreditHistory(token),
    enabled: options?.enabled !== false && !!token,
    staleTime: 300000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
    retry: 3,
  });
}
