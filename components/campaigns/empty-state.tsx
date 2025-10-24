'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ isFiltered = false, onClearFilters }: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Search className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          We couldn&apos;t find any campaigns matching your filters. Try adjusting your search criteria.
        </p>
        <Button onClick={onClearFilters} variant="outline">
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6">
        <div className="text-5xl">📢</div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">No campaigns yet</h3>
      <p className="text-gray-600 text-center mb-8 max-w-md">
        Start your first campaign to connect with influencers and grow your business.
      </p>
      <Link href="/campaigns/create">
        <Button size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Create Your First Campaign
        </Button>
      </Link>
    </div>
  );
}
