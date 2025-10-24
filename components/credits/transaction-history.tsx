/**
 * Transaction History Component
 * Displays paginated transaction history with filters
 */

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useTransactionHistory,
  exportTransactionsToCSV,
  Transaction,
} from '@/lib/hooks/use-transaction-history';
import { Download, ChevronLeft, ChevronRight, Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';

interface TransactionHistoryProps {
  businessId: string;
}

export function TransactionHistory({ businessId }: TransactionHistoryProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<Transaction['type'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<Transaction['status'] | 'all'>('all');

  const filters = {
    page,
    pageSize,
    ...(typeFilter !== 'all' && { type: typeFilter }),
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data, isLoading, error } = useTransactionHistory(businessId, filters);

  const handleExport = () => {
    if (data?.transactions) {
      exportTransactionsToCSV(data.transactions);
    }
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-100 text-green-800';
      case 'deduction':
        return 'bg-orange-100 text-orange-800';
      case 'refund':
        return 'bg-red-100 text-red-800';
      case 'bonus':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'stripe':
        return 'Stripe';
      case 'ios_iap':
        return 'iOS IAP';
      case 'admin':
        return 'Admin';
      default:
        return 'N/A';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>View all your credit transactions</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!data?.transactions || data.transactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <Select
            value={typeFilter}
            onValueChange={(value) => {
              setTypeFilter(value as Transaction['type'] | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="deduction">Deduction</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="bonus">Bonus</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as Transaction['status'] | 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading transactions: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && (!data?.transactions || data.transactions.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && data?.transactions && data.transactions.length > 0 && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                        <div className="text-xs text-gray-500">
                          {format(new Date(transaction.createdAt), 'h:mm a')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(transaction.type)}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {transaction.amount > 0 ? '+' : ''}
                          {transaction.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.receiptUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer">
                              <Receipt className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, data.total)} of {data.total} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data.hasMore}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
