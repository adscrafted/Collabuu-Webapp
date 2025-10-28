'use client';
import { Video, Eye, CheckCircle } from 'lucide-react';
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

interface ContentTabProps {
  campaignId: string;
}

export function ContentTab({ campaignId }: ContentTabProps) {
  const { toast } = useToast();

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
    const newSubmissions = submissions?.filter((s) => s.status === 'new') || [];

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


  // Sort submissions by most recent
  const sortedSubmissions = submissions
    ? [...submissions].sort((a, b) =>
        new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      )
    : [];

  // Count stats
  const newCount = submissions?.filter((s) => s.status === 'new').length || 0;
  const viewedCount = submissions?.filter((s) => s.status === 'viewed').length || 0;

  return (
    <div className="space-y-8">
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
              No Content Submissions Yet
            </h3>
            <p className="text-center text-sm text-gray-600 max-w-md">
              Content from influencers will appear here when they submit their work
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
