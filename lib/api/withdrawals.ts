import { apiClient } from './client';
import {
  WithdrawalRequest,
  WithdrawalListResponse,
  WithdrawalListFilters,
  ApproveWithdrawalRequest,
  CompleteWithdrawalRequest,
  RejectWithdrawalRequest,
  WithdrawalStats,
} from '@/lib/types/withdrawal';

export const withdrawalsApi = {
  // Get all withdrawal requests with filters (Admin only)
  getWithdrawals: async (filters?: WithdrawalListFilters): Promise<WithdrawalListResponse> => {
    const params = new URLSearchParams();

    if (filters?.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      params.append('status', statusArray.join(','));
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.influencerId) {
      params.append('influencerId', filters.influencerId);
    }
    if (filters?.minAmount !== undefined) {
      params.append('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      params.append('maxAmount', filters.maxAmount.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/api/admin/withdrawals${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<WithdrawalListResponse>(url);
    return response.data;
  },

  // Get single withdrawal request by ID (Admin only)
  getWithdrawal: async (id: string): Promise<WithdrawalRequest> => {
    const response = await apiClient.get<WithdrawalRequest>(`/api/admin/withdrawals/${id}`);
    return response.data;
  },

  // Get withdrawal statistics (Admin only)
  getWithdrawalStats: async (): Promise<WithdrawalStats> => {
    const response = await apiClient.get<WithdrawalStats>('/api/admin/withdrawals/stats');
    return response.data;
  },

  // Approve a withdrawal request (Admin only)
  approveWithdrawal: async (id: string, data?: ApproveWithdrawalRequest): Promise<WithdrawalRequest> => {
    const response = await apiClient.patch<WithdrawalRequest>(
      `/api/admin/withdrawals/${id}/approve`,
      data || {}
    );
    return response.data;
  },

  // Mark a withdrawal as completed (Admin only)
  completeWithdrawal: async (id: string, data: CompleteWithdrawalRequest): Promise<WithdrawalRequest> => {
    const response = await apiClient.patch<WithdrawalRequest>(
      `/api/admin/withdrawals/${id}/complete`,
      data
    );
    return response.data;
  },

  // Reject a withdrawal request (Admin only)
  rejectWithdrawal: async (id: string, data: RejectWithdrawalRequest): Promise<WithdrawalRequest> => {
    const response = await apiClient.patch<WithdrawalRequest>(
      `/api/admin/withdrawals/${id}/reject`,
      data
    );
    return response.data;
  },

  // Export withdrawals to CSV (Admin only)
  exportWithdrawals: async (filters?: WithdrawalListFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.status) {
      const statusArray = Array.isArray(filters.status) ? filters.status : [filters.status];
      params.append('status', statusArray.join(','));
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }

    const queryString = params.toString();
    const url = `/api/admin/withdrawals/export${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get(url, {
      responseType: 'blob',
    });

    return response.data;
  },
};
