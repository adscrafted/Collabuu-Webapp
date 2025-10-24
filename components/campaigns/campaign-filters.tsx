'use client';

import * as React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { DateRange } from 'react-day-picker';
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
import { DateRangePicker } from './date-range-picker';

interface CampaignFiltersProps {
  filters: CampaignFilters;
  onFiltersChange: (filters: CampaignFilters) => void;
}

export function CampaignFiltersBar({ filters, onFiltersChange }: CampaignFiltersProps) {
  const [searchInput, setSearchInput] = React.useState(filters.search || '');
  const [showFilters, setShowFilters] = React.useState(false);
  const filtersRef = React.useRef(filters);
  const onFiltersChangeRef = React.useRef(onFiltersChange);

  // Keep refs updated
  React.useEffect(() => {
    filtersRef.current = filters;
    onFiltersChangeRef.current = onFiltersChange;
  });

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const normalizedSearch = searchInput || undefined;
      const normalizedFilterSearch = filtersRef.current.search || undefined;

      if (normalizedSearch !== normalizedFilterSearch) {
        onFiltersChangeRef.current({ ...filtersRef.current, search: normalizedSearch, page: 1 });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]); // Only trigger on searchInput changes

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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      startDate: range?.from,
      endDate: range?.to,
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
    setSearchInput('');
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
    filters.startDate,
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
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
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
          <SelectTrigger className="w-full lg:w-[180px] h-10 rounded-lg border-gray-300">
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
          <SelectTrigger className="w-full lg:w-[200px] h-10 rounded-lg border-gray-300">
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
          <SelectTrigger className="w-full lg:w-[160px] h-10 rounded-lg border-gray-300">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most_visits">Most Visits</SelectItem>
            <SelectItem value="end_date">End Date</SelectItem>
          </SelectContent>
        </Select>

        {/* Toggle Advanced Filters */}
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="relative border-gray-300"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-pink-500 text-white h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters (Collapsible) */}
      {showFilters && (
        <div className="flex flex-col lg:flex-row gap-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Date Range
            </label>
            <DateRangePicker
              value={{
                from: filters.startDate,
                to: filters.endDate,
              }}
              onChange={handleDateRangeChange}
            />
          </div>

          {activeFilterCount > 0 && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.status && filters.status.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status.length}
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
              Type: {filters.type}
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
                onClick={() => {
                  setSearchInput('');
                  onFiltersChange({ ...filters, search: undefined, page: 1 });
                }}
                className="ml-1 hover:text-gray-900"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.startDate && (
            <Badge variant="secondary" className="gap-1">
              Date Range
              <button
                onClick={() =>
                  onFiltersChange({ ...filters, startDate: undefined, endDate: undefined, page: 1 })
                }
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
