'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Pause,
  Copy,
  Archive,
  Play,
  MoreVertical,
} from 'lucide-react';
import { useCampaign, useUpdateCampaignStatus, useDeleteCampaign, useDuplicateCampaign, useContentSubmissions } from '@/lib/hooks/use-campaign-detail';
import { CampaignStatus } from '@/lib/types/campaign';
import { shouldShowInfluencersTab, shouldShowContentTab } from '@/lib/utils/campaign-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { OverviewTab } from '@/components/campaigns/detail/overview-tab';
import { InfluencersTab } from '@/components/campaigns/detail/influencers-tab';
import { ContentTab } from '@/components/campaigns/detail/content-tab';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const campaignId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Queries
  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const { data: contentSubmissions } = useContentSubmissions(campaignId);

  // Mutations
  const updateStatus = useUpdateCampaignStatus(campaignId);
  const deleteCampaign = useDeleteCampaign();
  const duplicateCampaign = useDuplicateCampaign();

  // WEB-ONLY FEATURE: Pause/Resume/Archive Campaign
  // iOS does not have these status change features - web-exclusive campaign management
  const handleStatusChange = async (status: CampaignStatus) => {
    try {
      await updateStatus.mutateAsync(status);
      toast({
        title: 'Success',
        description: `Campaign ${status === CampaignStatus.PAUSED ? 'paused' : 'resumed'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update campaign status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign.mutateAsync(campaignId);
      toast({
        title: 'Success',
        description: 'Campaign deleted successfully',
      });
      router.push('/campaigns');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
    }
  };

  // WEB-ONLY FEATURE: Duplicate Campaign
  // iOS does not have this feature - web-exclusive power user feature
  const handleDuplicate = async () => {
    try {
      const newCampaign = await duplicateCampaign.mutateAsync(campaignId);
      toast({
        title: 'Success',
        description: 'Campaign duplicated successfully',
      });
      router.push(`/campaigns/${newCampaign.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to duplicate campaign',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: CampaignStatus) => {
    const statusConfig = {
      [CampaignStatus.DRAFT]: { label: 'Draft', variant: 'secondary' as const },
      [CampaignStatus.ACTIVE]: { label: 'Active', variant: 'default' as const },
      [CampaignStatus.PAUSED]: { label: 'Paused', variant: 'outline' as const },
      [CampaignStatus.COMPLETED]: { label: 'Completed', variant: 'secondary' as const },
      [CampaignStatus.CANCELLED]: { label: 'Cancelled', variant: 'destructive' as const },
    };

    const config = statusConfig[status] || { label: status || 'Unknown', variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Determine which tabs to show based on campaign type
  const showInfluencersTab = campaign ? shouldShowInfluencersTab(campaign) : true;
  const showContentTab = campaign ? shouldShowContentTab(campaign) : true;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm">
        <div className="mb-4 text-6xl">😕</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Campaign Not Found</h2>
        <p className="mb-6 text-gray-600">
          The campaign you're looking for doesn't exist or you don't have access to it.
        </p>
        <Button onClick={() => router.push('/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => router.push('/campaigns')}
          className="hover:text-gray-900 transition-colors"
        >
          Campaigns
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{campaign.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        {/* Title and Description */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{campaign.title}</h1>
            {getStatusBadge(campaign.status)}
          </div>
          <p className="text-gray-600 max-w-3xl">
            {campaign.description || 'No description provided'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Edit Button - Primary Action */}
          <Button
            variant="outline"
            onClick={() => router.push(`/campaigns/${campaignId}/edit`)}
            className="hover:bg-gray-50"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="hover:bg-gray-50">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Pause/Resume - conditionally rendered based on campaign status */}
              {campaign.status === CampaignStatus.ACTIVE && (
                <DropdownMenuItem onClick={() => handleStatusChange(CampaignStatus.PAUSED)}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Campaign
                </DropdownMenuItem>
              )}
              {campaign.status === CampaignStatus.PAUSED && (
                <DropdownMenuItem onClick={() => handleStatusChange(CampaignStatus.ACTIVE)}>
                  <Play className="mr-2 h-4 w-4" />
                  Resume Campaign
                </DropdownMenuItem>
              )}

              {/* Duplicate */}
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Archive */}
              <DropdownMenuItem onClick={() => handleStatusChange(CampaignStatus.CANCELLED)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>

              {/* Delete - Destructive Style */}
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="border-b border-gray-200">
          <TabsList className="h-auto p-0 bg-transparent space-x-8">
            <TabsTrigger
              value="overview"
              className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-gray-600 shadow-none transition-all hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
            >
              Overview
            </TabsTrigger>
            {showInfluencersTab && (
              <TabsTrigger
                value="influencers"
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-gray-600 shadow-none transition-all hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
              >
                Influencers
              </TabsTrigger>
            )}
            {showContentTab && (
              <TabsTrigger
                value="content"
                className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-0 pb-3 pt-2 font-semibold text-gray-600 shadow-none transition-all hover:text-gray-900 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none"
              >
                Content
                {contentSubmissions && contentSubmissions.filter((s) => s.status === 'new').length > 0 && (
                  <Badge className="ml-2 h-5 px-1.5 text-xs bg-red-600 hover:bg-red-700">
                    {contentSubmissions.filter((s) => s.status === 'new').length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0">
          <OverviewTab campaign={campaign} campaignId={campaignId} />
        </TabsContent>

        {showInfluencersTab && (
          <TabsContent value="influencers" className="mt-0">
            <InfluencersTab campaignId={campaignId} campaign={campaign} />
          </TabsContent>
        )}

        {showContentTab && (
          <TabsContent value="content" className="mt-0">
            <ContentTab campaignId={campaignId} />
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone. All
              campaign data, including participants, will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
