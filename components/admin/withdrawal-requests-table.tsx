'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, DollarSign, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WithdrawalRequest, WithdrawalStatus, WITHDRAWAL_STATUS_CONFIG } from '@/lib/types/withdrawal';
import { cn } from '@/lib/utils';

interface WithdrawalRequestsTableProps {
  withdrawals: WithdrawalRequest[];
  onApprove: (withdrawal: WithdrawalRequest) => void;
  onComplete: (withdrawal: WithdrawalRequest) => void;
  onReject: (withdrawal: WithdrawalRequest) => void;
  onViewDetails: (withdrawal: WithdrawalRequest) => void;
}

export function WithdrawalRequestsTable({
  withdrawals,
  onApprove,
  onComplete,
  onReject,
  onViewDetails,
}: WithdrawalRequestsTableProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  const getStatusBadge = (status: WithdrawalStatus) => {
    const config = WITHDRAWAL_STATUS_CONFIG[status];
    return (
      <Badge
        variant={config.variant}
        className={cn(config.bgClass, config.colorClass, 'font-medium')}
      >
        {config.label}
      </Badge>
    );
  };

  const canApprove = (status: WithdrawalStatus) => status === WithdrawalStatus.PENDING;
  const canComplete = (status: WithdrawalStatus) =>
    status === WithdrawalStatus.APPROVED || status === WithdrawalStatus.PROCESSING;
  const canReject = (status: WithdrawalStatus) => status === WithdrawalStatus.PENDING;

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Influencer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>E-Transfer Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Processed</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {withdrawals.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                No withdrawal requests found
              </TableCell>
            </TableRow>
          ) : (
            withdrawals.map((withdrawal) => (
              <TableRow key={withdrawal.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {withdrawal.influencerName || 'Unknown'}
                    </span>
                    {withdrawal.influencerEmail && (
                      <span className="text-sm text-gray-500">
                        {withdrawal.influencerEmail}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    {formatAmount(withdrawal.amount)}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700 font-medium">
                    {withdrawal.credits.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{withdrawal.etransferEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {formatDistanceToNow(new Date(withdrawal.requestedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  {withdrawal.processedAt ? (
                    <span className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(withdrawal.processedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetails(withdrawal)}>
                        View Details
                      </DropdownMenuItem>
                      {canApprove(withdrawal.status) && (
                        <DropdownMenuItem
                          onClick={() => onApprove(withdrawal)}
                          className="text-blue-600"
                        >
                          Approve
                        </DropdownMenuItem>
                      )}
                      {canComplete(withdrawal.status) && (
                        <DropdownMenuItem
                          onClick={() => onComplete(withdrawal)}
                          className="text-green-600"
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                      {canReject(withdrawal.status) && (
                        <DropdownMenuItem
                          onClick={() => onReject(withdrawal)}
                          className="text-red-600"
                        >
                          Reject
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
