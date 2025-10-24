'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
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
import { CampaignFilters, CampaignStatus, CampaignType } from '@/lib/types/campaign';

interface CampaignFiltersProps {
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
}

// Helper function to format status labels
const formatStatusLabel = (status: CampaignStatus): string => {
  const labels: Record<CampaignStatus, string> = {
    [CampaignStatus.ACTIVE]: 'Active',
    [CampaignStatus.PAUSED]: 'Paused',
    [CampaignStatus.DRAFT]: 'Draft',
    [CampaignStatus.COMPLETED]: 'Completed',
    [CampaignStatus.CANCELLED]: 'Cancelled',
  };
  return labels[status];
};

// Helper function to format type labels
const formatTypeLabel = (type: CampaignType): string => {
  const labels: Record<CampaignType, string> = {
    [CampaignType.PAY_PER_CUSTOMER]: 'Pay Per Customer',
    [CampaignType.MEDIA_EVENT]: 'Media Event',
    [CampaignType.REWARDS]: 'Rewards',
  };
  return labels[type];
};

export function CampaignFiltersBar({ filters, onFiltersChange }: CampaignFiltersProps) {
  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      onFiltersChange({ ...filters, status: undefined, page: 1 });
    } else {
      const statusArray = status.split(',') as CampaignStatus[];
      onFiltersChange({ ...filters, status: statusArray, page: 1 });
    }
  };

  const handleTypeChange = (type: string) => {
    onFiltersChange({
      ...filters,
      type: type === 'all' ? undefined : (type as CampaignType),
      page: 1,
    });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sort as CampaignFilters['sortBy'],
      page: 1,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
    });
  };

  // Count active filters
  const activeFilterCount = [
    filters.status?.length,
    filters.type,
    filters.search,
    filters.sortBy && filters.sortBy !== 'newest',
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search campaigns..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value || undefined, page: 1 })}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <button
              onClick={() => onFiltersChange({ ...filters, search: undefined, page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status?.join(',') || 'all'}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-lg border-pink-500">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={CampaignStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={CampaignStatus.PAUSED}>Paused</SelectItem>
            <SelectItem value={CampaignStatus.DRAFT}>Draft</SelectItem>
            <SelectItem value={CampaignStatus.COMPLETED}>Completed</SelectItem>
            <SelectItem value={CampaignStatus.CANCELLED}>Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-full lg:w-[200px] h-10 rounded-lg border-pink-500">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={CampaignType.PAY_PER_CUSTOMER}>Pay Per Customer</SelectItem>
            <SelectItem value={CampaignType.MEDIA_EVENT}>Media Event</SelectItem>
            <SelectItem value={CampaignType.REWARDS}>Rewards</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Filter */}
        <Select
          value={filters.sortBy || 'newest'}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-lg border-pink-500">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_visits">Most Visits</SelectItem>
            <SelectItem value="end_date">End Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.status && filters.status.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.map(formatStatusLabel).join(', ')}
              <button
                onClick={() => onFiltersChange({ ...filters, status: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Type: {formatTypeLabel(filters.type)}
              <button
                onClick={() => onFiltersChange({ ...filters, type: undefined, page: 1 })}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button
                onClick={() => onFiltersChange({ ...filters, search: undefined, page: 1 })}
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
