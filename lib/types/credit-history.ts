// Credit History Types
// Based on the iOS app BusinessCreditTransaction model

export enum BusinessTransactionType {
  PURCHASE = 'purchase',
  CAMPAIGN_CREATE = 'campaignCreate',
  CAMPAIGN_BOOST = 'campaignBoost',
  REFUND = 'refund',
  BONUS = 'bonus',
  ADJUSTMENT = 'adjustment',
}

export interface BusinessCreditTransaction {
  id: string;
  businessId: string;
  amount: number;
  type: BusinessTransactionType;
  description: string;
  campaignId?: string | null;
  campaignName?: string | null;
  createdAt: string; // ISO date string
  balanceAfter?: number | null;
}

export interface CreditHistoryResponse {
  transactions: BusinessCreditTransaction[];
  currentBalance: number;
}

// Helper function to get transaction type display info
export function getTransactionTypeInfo(type: BusinessTransactionType): {
  label: string;
  color: 'success' | 'error' | 'warning';
  isPositive: boolean;
} {
  switch (type) {
    case BusinessTransactionType.PURCHASE:
      return { label: 'Purchase', color: 'success', isPositive: true };
    case BusinessTransactionType.REFUND:
      return { label: 'Refund', color: 'success', isPositive: true };
    case BusinessTransactionType.BONUS:
      return { label: 'Bonus', color: 'success', isPositive: true };
    case BusinessTransactionType.CAMPAIGN_CREATE:
      return { label: 'Campaign Created', color: 'error', isPositive: false };
    case BusinessTransactionType.CAMPAIGN_BOOST:
      return { label: 'Campaign Boosted', color: 'error', isPositive: false };
    case BusinessTransactionType.ADJUSTMENT:
      return { label: 'Adjustment', color: 'warning', isPositive: false };
    default:
      return { label: 'Transaction', color: 'warning', isPositive: false };
  }
}
