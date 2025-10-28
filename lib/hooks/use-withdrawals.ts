import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { withdrawalsApi } from '@/lib/api/withdrawals';
import {
  WithdrawalListFilters,
  ApproveWithdrawalRequest,
  CompleteWithdrawalRequest,
  RejectWithdrawalRequest,
} from '@/lib/types/withdrawal';
import { toast } from 'sonner';

// Query keys
const withdrawalKeys = {
  all: ['withdrawals'] as const,
  lists: () => [...withdrawalKeys.all, 'list'] as const,
  list: (filters?: WithdrawalListFilters) => [...withdrawalKeys.lists(), filters] as const,
  details: () => [...withdrawalKeys.all, 'detail'] as const,
  detail: (id: string) => [...withdrawalKeys.details(), id] as const,
  stats: () => [...withdrawalKeys.all, 'stats'] as const,
};

// Hook for fetching withdrawal list
export function useWithdrawals(filters?: WithdrawalListFilters) {
  return useQuery({
    queryKey: withdrawalKeys.list(filters),
    queryFn: () => withdrawalsApi.getWithdrawals(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Hook for fetching single withdrawal
export function useWithdrawal(id: string) {
  return useQuery({
    queryKey: withdrawalKeys.detail(id),
    queryFn: () => withdrawalsApi.getWithdrawal(id),
    enabled: !!id,
  });
}

// Hook for fetching withdrawal stats
export function useWithdrawalStats() {
  return useQuery({
    queryKey: withdrawalKeys.stats(),
    queryFn: () => withdrawalsApi.getWithdrawalStats(),
    staleTime: 60000, // 1 minute
  });
}

// Hook for approving withdrawal
export function useApproveWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ApproveWithdrawalRequest }) =>
      withdrawalsApi.approveWithdrawal(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.stats() });

      toast.success('Withdrawal Approved', {
        description: 'The withdrawal request has been approved successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Approval Failed', {
        description: error.message || 'Failed to approve withdrawal request.',
      });
    },
  });
}

// Hook for completing withdrawal
export function useCompleteWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompleteWithdrawalRequest }) =>
      withdrawalsApi.completeWithdrawal(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.stats() });

      toast.success('Withdrawal Completed', {
        description: 'The withdrawal has been marked as completed successfully.',
      });
    },
    onError: (error: Error) => {
      toast.error('Completion Failed', {
        description: error.message || 'Failed to mark withdrawal as completed.',
      });
    },
  });
}

// Hook for rejecting withdrawal
export function useRejectWithdrawal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RejectWithdrawalRequest }) =>
      withdrawalsApi.rejectWithdrawal(id, data),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: withdrawalKeys.stats() });

      toast.success('Withdrawal Rejected', {
        description: 'The withdrawal request has been rejected.',
      });
    },
    onError: (error: Error) => {
      toast.error('Rejection Failed', {
        description: error.message || 'Failed to reject withdrawal request.',
      });
    },
  });
}

// Hook for exporting withdrawals
export function useExportWithdrawals() {
  return useMutation({
    mutationFn: (filters?: WithdrawalListFilters) => withdrawalsApi.exportWithdrawals(filters),
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `withdrawals-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export Successful', {
        description: 'Withdrawal data has been exported to CSV.',
      });
    },
    onError: (error: Error) => {
      toast.error('Export Failed', {
        description: error.message || 'Failed to export withdrawal data.',
      });
    },
  });
}
