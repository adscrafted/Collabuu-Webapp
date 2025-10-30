'use client';

import * as React from 'react';
import { Search, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { WithdrawalListFilters, WithdrawalStatus, WITHDRAWAL_STATUS_CONFIG } from '@/lib/types/withdrawal';

// Client-only wrapper to prevent hydration mismatches
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

interface WithdrawalFiltersProps {
  filters: WithdrawalListFilters;
  onFiltersChange: (filters: WithdrawalListFilters) => void;
}

export function WithdrawalFilters({ filters, onFiltersChange }: WithdrawalFiltersProps) {
  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      onFiltersChange({ ...filters, status: undefined, page: 1 });
    } else {
      onFiltersChange({ ...filters, status: status as WithdrawalStatus, page: 1 });
    }
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sort as WithdrawalListFilters['sortBy'],
      page: 1,
    });
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      onFiltersChange({ ...filters, startDate: value || undefined, page: 1 });
    } else {
      onFiltersChange({ ...filters, endDate: value || undefined, page: 1 });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.sortBy && filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  const getStatusLabel = (status: WithdrawalStatus): string => {
    return WITHDRAWAL_STATUS_CONFIG[status].label;
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Status Filter */}
        <ClientOnly>
          <Select
            value={Array.isArray(filters.status) ? (filters.status[0] as string) : (filters.status || 'all')}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-lg border-pink-500">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={WithdrawalStatus.PENDING}>Pending</SelectItem>
              <SelectItem value={WithdrawalStatus.APPROVED}>Approved</SelectItem>
              <SelectItem value={WithdrawalStatus.PROCESSING}>Processing</SelectItem>
              <SelectItem value={WithdrawalStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={WithdrawalStatus.REJECTED}>Rejected</SelectItem>
              <SelectItem value={WithdrawalStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </ClientOnly>

        {/* Date Range Filters */}
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              placeholder="Start date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <Input
              type="date"
              placeholder="End date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sort Filter */}
        <ClientOnly>
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-lg border-pink-500">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="amount_high">Highest Amount</SelectItem>
              <SelectItem value="amount_low">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </ClientOnly>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {getStatusLabel((Array.isArray(filters.status) ? filters.status[0] : filters.status) as WithdrawalStatus)}
              <button
                onClick={() => onFiltersChange({ ...filters, status: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              From: {new Date(filters.startDate).toLocaleDateString()}
              <button
                onClick={() => onFiltersChange({ ...filters, startDate: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.endDate && (
            <Badge variant="secondary" className="gap-1">
              To: {new Date(filters.endDate).toLocaleDateString()}
              <button
                onClick={() => onFiltersChange({ ...filters, endDate: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
