// Withdrawal Request Types and Interfaces

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum WithdrawalMethod {
  ETRANSFER = 'etransfer',
}

export interface WithdrawalRequest {
  id: string;
  influencerId: string;
  influencerName?: string;
  influencerEmail?: string;
  influencerAvatar?: string;
  amount: number; // CAD amount
  credits: number; // Credits being withdrawn
  method: WithdrawalMethod;
  etransferEmail: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalListFilters {
  status?: WithdrawalStatus | WithdrawalStatus[];
  startDate?: string;
  endDate?: string;
  influencerId?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'newest' | 'oldest' | 'amount_high' | 'amount_low';
  page?: number;
  limit?: number;
}

export interface WithdrawalListResponse {
  withdrawals: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalPendingAmount?: number;
  totalProcessedAmount?: number;
}

export interface ApproveWithdrawalRequest {
  notes?: string;
}

export interface CompleteWithdrawalRequest {
  transactionId: string;
  notes?: string;
}

export interface RejectWithdrawalRequest {
  reason: string;
  notes?: string;
}

export interface WithdrawalStats {
  totalPending: number;
  totalApproved: number;
  totalProcessing: number;
  totalCompleted: number;
  totalRejected: number;
  totalPendingAmount: number;
  totalProcessedAmount: number;
}

// Status badge configurations
export const WITHDRAWAL_STATUS_CONFIG: Record<
  WithdrawalStatus,
  {
    label: string;
    colorClass: string;
    bgClass: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  [WithdrawalStatus.PENDING]: {
    label: 'Pending',
    colorClass: 'text-yellow-700',
    bgClass: 'bg-yellow-100',
    variant: 'default',
  },
  [WithdrawalStatus.APPROVED]: {
    label: 'Approved',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-100',
    variant: 'default',
  },
  [WithdrawalStatus.PROCESSING]: {
    label: 'Processing',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-100',
    variant: 'default',
  },
  [WithdrawalStatus.COMPLETED]: {
    label: 'Completed',
    colorClass: 'text-green-700',
    bgClass: 'bg-green-100',
    variant: 'default',
  },
  [WithdrawalStatus.REJECTED]: {
    label: 'Rejected',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-100',
    variant: 'destructive',
  },
  [WithdrawalStatus.CANCELLED]: {
    label: 'Cancelled',
    colorClass: 'text-gray-700',
    bgClass: 'bg-gray-100',
    variant: 'secondary',
  },
};

// Exchange rate constant
export const CREDITS_TO_CAD_RATE = 0.01; // 1 credit = $0.01 CAD
export const MINIMUM_WITHDRAWAL_CREDITS = 10; // Minimum 10 credits ($0.10 CAD)
