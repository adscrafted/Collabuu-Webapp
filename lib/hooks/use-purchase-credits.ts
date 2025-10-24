/**
 * React Query hook for purchasing credits with Stripe
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/lib/api/client';
import { getStripe } from '@/lib/stripe/config';

interface PurchaseCreditsParams {
  packageId: string;
  credits: number;
  price: number;
  userId: string;
  businessId: string;
  userEmail: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
  success: boolean;
}

/**
 * Create checkout session and redirect to Stripe
 */
async function purchaseCredits(params: PurchaseCreditsParams): Promise<CheckoutSessionResponse> {
  try {
    // Call API to create checkout session
    const response = await apiClient.post<CheckoutSessionResponse>(
      '/api/stripe/create-checkout-session',
      params,
      {
        timeout: 10000,
      }
    );

    const { sessionId, url } = response.data;

    if (!sessionId || !url) {
      throw new Error('Invalid response from checkout session API');
    }

    // Redirect to Stripe Checkout URL
    window.location.href = url;

    return response.data;
  } catch (error) {
    console.error('Error purchasing credits:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(message);
    }

    throw error;
  }
}

/**
 * React Query mutation hook for purchasing credits
 */
export function usePurchaseCredits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseCredits,
    onSuccess: () => {
      // Invalidate credit balance query to refetch after successful purchase
      queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
      queryClient.invalidateQueries({ queryKey: ['transactionHistory'] });
    },
    onError: (error: Error) => {
      console.error('Purchase credits error:', error);
    },
  });
}
