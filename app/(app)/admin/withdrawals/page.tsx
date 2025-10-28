'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Download, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WithdrawalFilters } from '@/components/admin/withdrawal-filters';
import { WithdrawalRequestsTable } from '@/components/admin/withdrawal-requests-table';
import { WithdrawalActionModal } from '@/components/admin/withdrawal-action-modal';
import { WithdrawalDetailCard } from '@/components/admin/withdrawal-detail-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useWithdrawals,
  useWithdrawalStats,
  useApproveWithdrawal,
  useCompleteWithdrawal,
  useRejectWithdrawal,
  useExportWithdrawals,
} from '@/lib/hooks/use-withdrawals';
import { WithdrawalListFilters, WithdrawalRequest, WithdrawalStatus } from '@/lib/types/withdrawal';

const ITEMS_PER_PAGE = 20;

export default function AdminWithdrawalsPage() {
  const [filters, setFilters] = React.useState<WithdrawalListFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'newest',
    status: WithdrawalStatus.PENDING,
  });

  const [selectedWithdrawal, setSelectedWithdrawal] = React.useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = React.useState<'approve' | 'complete' | 'reject'>('approve');
  const [isActionModalOpen, setIsActionModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);

  // Fetch data
  const { data, isLoading, error } = useWithdrawals(filters);
  const { data: stats } = useWithdrawalStats();

  // Mutations
  const approveMutation = useApproveWithdrawal();
  const completeMutation = useCompleteWithdrawal();
  const rejectMutation = useRejectWithdrawal();
  const exportMutation = useExportWithdrawals();

  const handleApprove = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setActionType('approve');
    setIsActionModalOpen(true);
  };

  const handleComplete = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setActionType('complete');
    setIsActionModalOpen(true);
  };

  const handleReject = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setActionType('reject');
    setIsActionModalOpen(true);
  };

  const handleViewDetails = (withdrawal: WithdrawalRequest) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailModalOpen(true);
  };

  const handleActionConfirm = async (actionData: {
    transactionId?: string;
    reason?: string;
    notes?: string;
  }) => {
    if (!selectedWithdrawal) return;

    switch (actionType) {
      case 'approve':
        await approveMutation.mutateAsync({
          id: selectedWithdrawal.id,
          data: { notes: actionData.notes },
        });
        break;
      case 'complete':
        await completeMutation.mutateAsync({
          id: selectedWithdrawal.id,
          data: {
            transactionId: actionData.transactionId!,
            notes: actionData.notes,
          },
        });
        break;
      case 'reject':
        await rejectMutation.mutateAsync({
          id: selectedWithdrawal.id,
          data: {
            reason: actionData.reason!,
            notes: actionData.notes,
          },
        });
        break;
    }
  };

  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error loading withdrawals</h3>
          <p className="text-red-700">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage influencer credit withdrawal requests
          </p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          className="gap-2"
          disabled={exportMutation.isPending}
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPending}</div>
              <p className="text-xs text-gray-500 mt-1">
                {formatAmount(stats.totalPendingAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApproved}</div>
              <p className="text-xs text-gray-500 mt-1">Ready for processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompleted}</div>
              <p className="text-xs text-gray-500 mt-1">
                {formatAmount(stats.totalProcessedAmount)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProcessing}</div>
              <p className="text-xs text-gray-500 mt-1">In progress</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <WithdrawalFilters filters={filters} onFiltersChange={setFilters} />

      {/* Results Summary */}
      {!isLoading && data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {data.withdrawals.length === 0
              ? 'No withdrawal requests found'
              : `Showing ${((filters.page || 1) - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(
                  (filters.page || 1) * ITEMS_PER_PAGE,
                  data.total
                )} of ${data.total} requests`}
          </p>
        </div>
      )}

      {/* Withdrawals Table */}
      <div>
        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
              </div>
            </CardContent>
          </Card>
        ) : data && data.withdrawals.length > 0 ? (
          <>
            <WithdrawalRequestsTable
              withdrawals={data.withdrawals}
              onApprove={handleApprove}
              onComplete={handleComplete}
              onReject={handleReject}
              onViewDetails={handleViewDetails}
            />

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) - 1)}
                  disabled={filters.page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, data.totalPages) }, (_, i) => {
                    let pageNumber: number;
                    const currentPage = filters.page || 1;

                    if (data.totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= data.totalPages - 2) {
                      pageNumber = data.totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className="w-10"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange((filters.page || 1) + 1)}
                  disabled={filters.page === data.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-gray-500">No withdrawal requests found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your filters
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Modal */}
      <WithdrawalActionModal
        open={isActionModalOpen}
        onOpenChange={setIsActionModalOpen}
        withdrawal={selectedWithdrawal}
        actionType={actionType}
        onConfirm={handleActionConfirm}
      />

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Withdrawal Request Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && <WithdrawalDetailCard withdrawal={selectedWithdrawal} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
