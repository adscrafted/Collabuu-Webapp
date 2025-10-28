'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { User, Mail, DollarSign, CreditCard, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WithdrawalRequest, WITHDRAWAL_STATUS_CONFIG, CREDITS_TO_CAD_RATE } from '@/lib/types/withdrawal';
import { cn } from '@/lib/utils';

interface WithdrawalDetailCardProps {
  withdrawal: WithdrawalRequest;
}

export function WithdrawalDetailCard({ withdrawal }: WithdrawalDetailCardProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const statusConfig = WITHDRAWAL_STATUS_CONFIG[withdrawal.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Withdrawal Request Details</CardTitle>
            <CardDescription>Request ID: {withdrawal.id}</CardDescription>
          </div>
          <Badge
            variant={statusConfig.variant}
            className={cn(statusConfig.bgClass, statusConfig.colorClass, 'font-medium')}
          >
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Influencer Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Influencer Information
          </h3>
          <div className="space-y-2 pl-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">
                {withdrawal.influencerName || 'N/A'}
              </span>
            </div>
            {withdrawal.influencerEmail && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{withdrawal.influencerEmail}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Influencer ID:</span>
              <span className="font-mono text-xs text-gray-600">{withdrawal.influencerId}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Withdrawal Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Withdrawal Details
          </h3>
          <div className="space-y-2 pl-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount (CAD):</span>
              <span className="font-semibold text-green-700 text-lg">
                {formatAmount(withdrawal.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Credits:</span>
              <span className="font-medium text-gray-900">
                {withdrawal.credits.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Exchange Rate:</span>
              <span className="text-gray-700">1 credit = ${CREDITS_TO_CAD_RATE} CAD</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Method:</span>
              <span className="font-medium text-gray-900">E-Transfer</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* E-Transfer Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Transfer Information
          </h3>
          <div className="space-y-2 pl-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{withdrawal.etransferEmail}</span>
            </div>
            {withdrawal.transactionId && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs text-gray-900">
                  {withdrawal.transactionId}
                </span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </h3>
          <div className="space-y-2 pl-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Requested At:</span>
              <span className="font-medium text-gray-900">
                {format(new Date(withdrawal.requestedAt), 'PPpp')}
              </span>
            </div>
            {withdrawal.processedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processed At:</span>
                <span className="font-medium text-gray-900">
                  {format(new Date(withdrawal.processedAt), 'PPpp')}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Created At:</span>
              <span className="text-gray-700">
                {format(new Date(withdrawal.createdAt), 'PPpp')}
              </span>
            </div>
            {withdrawal.updatedAt && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Updated At:</span>
                <span className="text-gray-700">
                  {format(new Date(withdrawal.updatedAt), 'PPpp')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Notes or Rejection Reason */}
        {(withdrawal.notes || withdrawal.rejectionReason) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                {withdrawal.rejectionReason ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                {withdrawal.rejectionReason ? 'Rejection Reason' : 'Notes'}
              </h3>
              <div className="pl-6">
                {withdrawal.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-900">{withdrawal.rejectionReason}</p>
                  </div>
                )}
                {withdrawal.notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">{withdrawal.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
