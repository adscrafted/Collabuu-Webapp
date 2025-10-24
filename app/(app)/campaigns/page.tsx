'use client';

import * as React from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/lib/hooks/use-campaigns';
import { CampaignFilters, CampaignStatus } from '@/lib/types/campaign';
import { CampaignCard } from '@/components/campaigns/campaign-card';
import { CampaignListSkeleton } from '@/components/campaigns/campaign-skeleton';
import { EmptyState } from '@/components/campaigns/empty-state';
import { CampaignFiltersBar } from '@/components/campaigns/campaign-filters';

const ITEMS_PER_PAGE = 20;

export default function CampaignsPage() {
  const [filters, setFilters] = React.useState<CampaignFilters>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    sortBy: 'newest',
    status: [CampaignStatus.ACTIVE],
  });

  const { data, isLoading, error } = useCampaigns(filters);

  const hasFilters = Boolean(
    filters.status?.length ||
    filters.type ||
    filters.search ||
    filters.startDate ||
    (filters.sortBy && filters.sortBy !== 'newest')
  );

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: ITEMS_PER_PAGE,
      sortBy: 'newest',
      status: [CampaignStatus.ACTIVE],
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        </div>
        <div className="rounded-xl bg-red-50 border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error loading campaigns</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your marketing campaigns
          </p>
        </div>
        <Link href="/campaigns/new">
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <CampaignFiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* Results Summary */}
      {!isLoading && data && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {data.total === 0 ? (
              'No campaigns found'
            ) : (
              <>
                Showing {((filters.page || 1) - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min((filters.page || 1) * ITEMS_PER_PAGE, data.total)} of {data.total} campaigns
              </>
            )}
          </p>
        </div>
      )}

      {/* Campaign Grid */}
      <div>
        {isLoading ? (
          <CampaignListSkeleton count={6} />
        ) : data && data.campaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
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
          <EmptyState isFiltered={hasFilters} onClearFilters={handleClearFilters} />
        )}
      </div>
    </div>
  );
}
