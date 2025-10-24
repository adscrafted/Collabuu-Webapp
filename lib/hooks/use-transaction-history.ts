/**
 * React Query hook for fetching transaction history
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiClient } from '@/lib/api/client';

export interface Transaction {
  id: string;
  type: 'purchase' | 'deduction' | 'refund' | 'bonus';
  amount: number; // Credits (positive or negative)
  paymentMethod?: 'stripe' | 'ios_iap' | 'admin';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  metadata?: {
    packageId?: string;
    campaignId?: string;
    sessionId?: string;
    paymentIntentId?: string;
  };
  createdAt: string;
  receiptUrl?: string;
}

interface TransactionHistoryResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface TransactionFilters {
  page?: number;
  pageSize?: number;
  type?: Transaction['type'];
  status?: Transaction['status'];
  startDate?: string;
  endDate?: string;
}

/**
 * Fetch transaction history from iOS backend
 */
async function fetchTransactionHistory(
  businessId: string,
  filters?: TransactionFilters
): Promise<TransactionHistoryResponse> {
  try {
    // Build query params (iOS backend uses limit/offset instead of page/pageSize)
    const params = new URLSearchParams();

    if (filters?.page && filters?.pageSize) {
      const offset = (filters.page - 1) * filters.pageSize;
      params.append('offset', offset.toString());
      params.append('limit', filters.pageSize.toString());
    } else if (filters?.pageSize) {
      params.append('limit', filters.pageSize.toString());
    }

    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const url = `/api/business/credits/transactions${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url, {
      timeout: 10000,
    });

    // Transform iOS backend response to match expected format
    const transactions = response.data.transactions || response.data || [];
    const total = response.data.total || transactions.length;

    return {
      transactions: transactions.map((tx: any) => ({
        id: tx.id,
        type: tx.transaction_type || 'purchase',
        amount: tx.credits_added || tx.amount || 0,
        paymentMethod: tx.payment_method || 'stripe',
        status: tx.status || 'completed',
        description: tx.description || 'Credit Transaction',
        metadata: {
          packageId: tx.product_id,
          paymentIntentId: tx.apple_transaction_id,
        },
        createdAt: tx.created_at,
        receiptUrl: tx.receipt_url,
      })),
      total,
      page: filters?.page || 1,
      pageSize: filters?.pageSize || 50,
      hasMore: total > ((filters?.page || 1) * (filters?.pageSize || 50)),
    };
  } catch (error) {
    console.error('Error fetching transaction history:', error);

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.response?.data?.error || error.message;
      throw new Error(message);
    }

    throw error;
  }
}

/**
 * React Query hook for transaction history with filters
 */
export function useTransactionHistory(
  businessId: string,
  filters?: TransactionFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['transactionHistory', businessId, filters],
    queryFn: () => fetchTransactionHistory(businessId, filters),
    enabled: options?.enabled !== false && !!businessId,
    staleTime: 60000, // Consider data fresh for 60 seconds
    retry: 2,
  });
}

/**
 * Export to CSV
 */
export function exportTransactionsToCSV(transactions: Transaction[]): void {
  const headers = ['Date', 'Type', 'Amount', 'Payment Method', 'Status', 'Description'];

  const rows = transactions.map((tx) => [
    new Date(tx.createdAt).toLocaleDateString(),
    tx.type,
    tx.amount > 0 ? `+${tx.amount}` : tx.amount.toString(),
    tx.paymentMethod || 'N/A',
    tx.status,
    tx.description,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
