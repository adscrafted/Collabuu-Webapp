'use client';

import { useState } from 'react';
import { Video, Filter, Eye, CheckCircle } from 'lucide-react';
import {
  useContentSubmissions,
  useMarkContentViewed,
  useApproveContent,
} from '@/lib/hooks/use-campaign-detail';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { ContentSubmissionCard } from '@/components/campaigns/content-submission-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContentTabProps {
  campaignId: string;
}

type FilterOption = 'all' | 'new' | 'viewed' | 'approved';
type SortOption = 'recent' | 'oldest' | 'platform';

export function ContentTab({ campaignId }: ContentTabProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Queries
  const { data: submissions, isLoading } = useContentSubmissions(campaignId);

  // Mutations
  const markAsViewed = useMarkContentViewed(campaignId);
  const approveContent = useApproveContent(campaignId);

  const handleView = async (contentId: string) => {
    try {
      await markAsViewed.mutateAsync(contentId);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark content as viewed',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllViewed = async () => {
    const newSubmissions = filteredSubmissions.filter((s) => s.status === 'new');

    if (newSubmissions.length === 0) {
      toast({
        title: 'No New Content',
        description: 'All content has been viewed',
      });
      return;
    }

    try {
      await Promise.all(
        newSubmissions.map((submission) => markAsViewed.mutateAsync(submission.id))
      );
      toast({
        title: 'Success',
        description: `Marked ${newSubmissions.length} submissions as viewed`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all content as viewed',
        variant: 'destructive',
      });
    }
  };

  const handleApproveAllViewed = async () => {
    const viewedSubmissions = submissions?.filter((s) => s.status === 'viewed') || [];

    if (viewedSubmissions.length === 0) {
      toast({
        title: 'No Viewed Content',
        description: 'All viewed content has already been approved',
      });
      return;
    }

    try {
      await Promise.all(
        viewedSubmissions.map((submission) => approveContent.mutateAsync(submission.id))
      );
      toast({
        title: 'Content Approved',
        description: `${viewedSubmissions.length} submissions have been approved`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve some submissions',
        variant: 'destructive',
      });
    }
  };


  // Filter submissions
  const filteredSubmissions = submissions
    ? submissions.filter((submission) => {
        if (filter === 'all') return true;
        return submission.status === filter;
      })
    : [];

  // Sort submissions
  const sortedSubmissions = [...filteredSubmissions].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
      case 'platform':
        return a.platform.localeCompare(b.platform);
      case 'recent':
      default:
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    }
  });

  // Count stats
  const newCount = submissions?.filter((s) => s.status === 'new').length || 0;
  const viewedCount = submissions?.filter((s) => s.status === 'viewed').length || 0;
  const approvedCount = submissions?.filter((s) => s.status === 'approved').length || 0;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Submissions
            </CardTitle>
            <div className="rounded-full bg-blue-100 p-2">
              <Video className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {submissions?.length || 0}
            </div>
            <p className="mt-1 text-xs text-gray-600">All content submitted</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Content
            </CardTitle>
            <div className="rounded-full bg-red-100 p-2">
              <Badge className="h-6 w-6 flex items-center justify-center bg-red-600 p-0">
                {newCount}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{newCount}</div>
            <p className="mt-1 text-xs text-gray-600">Unviewed submissions</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved
            </CardTitle>
            <div className="rounded-full bg-green-100 p-2">
              <Eye className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{approvedCount}</div>
            <p className="mt-1 text-xs text-gray-600">Content approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Header & Filters */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Content Submissions</CardTitle>
              <CardDescription className="mt-1">
                View and manage content submitted by influencers
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[160px] shadow-sm">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All ({submissions?.length || 0})
                  </SelectItem>
                  <SelectItem value="new">
                    New ({newCount})
                  </SelectItem>
                  <SelectItem value="viewed">
                    Viewed ({viewedCount})
                  </SelectItem>
                  <SelectItem value="approved">
                    Approved ({approvedCount})
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[160px] shadow-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="platform">By Platform</SelectItem>
                </SelectContent>
              </Select>

              {newCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleMarkAllViewed}
                  disabled={markAsViewed.isPending}
                  className="shadow-sm hover:shadow transition-shadow"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Mark All Viewed
                </Button>
              )}

              {viewedCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleApproveAllViewed}
                  disabled={approveContent.isPending}
                  className="shadow-sm hover:shadow transition-shadow"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve All Viewed ({viewedCount})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      ) : sortedSubmissions.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedSubmissions.map((submission) => (
            <ContentSubmissionCard
              key={submission.id}
              submission={submission}
              campaignId={campaignId}
              onView={handleView}
              isLoading={markAsViewed.isPending}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Video className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {filter === 'all'
                ? 'No Content Submissions Yet'
                : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Content`}
            </h3>
            <p className="text-center text-sm text-gray-600 max-w-md">
              {filter === 'all'
                ? 'Content from influencers will appear here when they submit their work'
                : `Content marked as "${filter}" will appear here`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
