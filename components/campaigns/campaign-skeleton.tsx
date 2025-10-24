import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CampaignSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      {/* Image Skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />

      <CardContent className="p-5">
        {/* Type Badge Skeleton */}
        <Skeleton className="h-5 w-32 mb-3 rounded-md" />

        {/* Title Skeleton */}
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Date Range Skeleton */}
        <Skeleton className="h-4 w-48 mb-4" />

        {/* Metrics Row Skeleton */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>

        {/* Credits Label Skeleton */}
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Progress Bar Skeleton */}
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

export function CampaignListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CampaignSkeleton key={i} />
      ))}
    </div>
  );
}
