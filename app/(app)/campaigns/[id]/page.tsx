'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
} from 'lucide-react';
import { useCampaign, useContentSubmissions } from '@/lib/hooks/use-campaign-detail';
import { CampaignStatus } from '@/lib/types/campaign';
import { shouldShowInfluencersTab, shouldShowContentTab } from '@/lib/utils/campaign-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { OverviewTab } from '@/components/campaigns/detail/overview-tab';
import { InfluencersTab } from '@/components/campaigns/detail/influencers-tab';
import { ContentTab } from '@/components/campaigns/detail/content-tab';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: campaign, isLoading, error } = useCampaign(campaignId);
  const { data: contentSubmissions } = useContentSubmissions(campaignId);

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
          <Skeleton className="h-10 w-20" />
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
          <OverviewTab campaign={campaign} campaignId={campaignId} onTabChange={setActiveTab} />
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
    </div>
  );
}
