import { z } from 'zod';
import { WithdrawalStatus, WithdrawalMethod } from '@/lib/types/withdrawal';

/**
 * Schema for approving a withdrawal request
 */
export const approveWithdrawalSchema = z.object({
  notes: z.string().optional(),
});

/**
 * Schema for completing a withdrawal request
 */
export const completeWithdrawalSchema = z.object({
  transactionId: z
    .string()
    .min(1, 'Transaction ID is required')
    .max(255, 'Transaction ID is too long'),
  notes: z.string().optional(),
});

/**
 * Schema for rejecting a withdrawal request
 */
export const rejectWithdrawalSchema = z.object({
  reason: z
    .string()
    .min(1, 'Rejection reason is required')
    .max(500, 'Rejection reason is too long'),
  notes: z.string().optional(),
});

/**
 * Schema for withdrawal list filters
 */
export const withdrawalListFiltersSchema = z.object({
  status: z
    .union([
      z.nativeEnum(WithdrawalStatus),
      z.array(z.nativeEnum(WithdrawalStatus)),
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  influencerId: z.string().uuid().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  sortBy: z.enum(['newest', 'oldest', 'amount_high', 'amount_low']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

/**
 * Type exports for convenience
 */
export type ApproveWithdrawalInput = z.infer<typeof approveWithdrawalSchema>;
export type CompleteWithdrawalInput = z.infer<typeof completeWithdrawalSchema>;
export type RejectWithdrawalInput = z.infer<typeof rejectWithdrawalSchema>;
export type WithdrawalListFiltersInput = z.infer<typeof withdrawalListFiltersSchema>;
