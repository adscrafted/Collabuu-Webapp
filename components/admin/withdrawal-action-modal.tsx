'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WithdrawalRequest } from '@/lib/types/withdrawal';

type ActionType = 'approve' | 'complete' | 'reject';

interface WithdrawalActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  withdrawal: WithdrawalRequest | null;
  actionType: ActionType;
  onConfirm: (data: {
    transactionId?: string;
    reason?: string;
    notes?: string;
  }) => Promise<void>;
}

export function WithdrawalActionModal({
  open,
  onOpenChange,
  withdrawal,
  actionType,
  onConfirm,
}: WithdrawalActionModalProps) {
  const [transactionId, setTransactionId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setTransactionId('');
      setReason('');
      setNotes('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (actionType === 'complete' && !transactionId.trim()) {
      setError('Transaction ID is required');
      return;
    }

    if (actionType === 'reject' && !reason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm({
        transactionId: transactionId.trim() || undefined,
        reason: reason.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case 'approve':
        return 'Approve Withdrawal Request';
      case 'complete':
        return 'Mark Withdrawal as Completed';
      case 'reject':
        return 'Reject Withdrawal Request';
    }
  };

  const getDescription = () => {
    if (!withdrawal) return '';

    const amount = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(withdrawal.amount);

    switch (actionType) {
      case 'approve':
        return `You are about to approve a withdrawal request for ${amount} (${withdrawal.credits} credits) to ${withdrawal.etransferEmail}. This action will mark the request as approved and ready for processing.`;
      case 'complete':
        return `You are about to mark a withdrawal request for ${amount} (${withdrawal.credits} credits) as completed. Please enter the E-Transfer transaction ID.`;
      case 'reject':
        return `You are about to reject a withdrawal request for ${amount} (${withdrawal.credits} credits). Please provide a reason for rejection that will be sent to the influencer.`;
    }
  };

  const getButtonText = () => {
    switch (actionType) {
      case 'approve':
        return 'Approve Request';
      case 'complete':
        return 'Mark as Completed';
      case 'reject':
        return 'Reject Request';
    }
  };

  const getButtonVariant = () => {
    switch (actionType) {
      case 'approve':
        return 'default';
      case 'complete':
        return 'default';
      case 'reject':
        return 'destructive';
    }
  };

  if (!withdrawal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-2">
              {getDescription()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Transaction ID (Complete only) */}
            {actionType === 'complete' && (
              <div className="space-y-2">
                <Label htmlFor="transactionId">
                  E-Transfer Transaction ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-gray-500">
                  Enter the transaction ID from your E-Transfer confirmation
                </p>
              </div>
            )}

            {/* Rejection Reason (Reject only) */}
            {actionType === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-gray-500">
                  This reason will be sent to the influencer
                </p>
              </div>
            )}

            {/* Notes (All actions) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any internal notes..."
                rows={3}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Internal notes (not visible to influencer)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant={getButtonVariant()} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {getButtonText()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
