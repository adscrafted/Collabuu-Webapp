'use client';

import { format, parseISO, startOfDay } from 'date-fns';
import { Calendar, Tag, TrendingUp, Users, Target, Smartphone, UserCheck, CalendarClock, Eye, Camera } from 'lucide-react';
import { useCampaignMetrics, useCampaignVisits, useCampaignApplications, useContentSubmissions } from '@/lib/hooks/use-campaign-detail';
import { Campaign, CampaignType, getCampaignType } from '@/lib/types/campaign';
import {
  getCampaignTypeLabel,
  getEventTypeLabel,
  getPrimaryMetricLabel,
  shouldShowCreditBreakdown,
  getInfluencerSpotsText,
  getMediaEventCredits,
} from '@/lib/utils/campaign-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { VisitorTrafficChart } from '@/components/campaigns/charts/visitor-traffic-chart';

interface OverviewTabProps {
  campaign: Campaign;
  campaignId: string;
  onTabChange?: (tab: string) => void;
}

export function OverviewTab({ campaign, campaignId, onTabChange }: OverviewTabProps) {
  const { toast } = useToast();
  const { data: metrics, isLoading: metricsLoading } = useCampaignMetrics(campaignId);
  const { data: visits, isLoading: visitsLoading } = useCampaignVisits(campaignId);
  const { data: applications, isLoading: applicationsLoading } = useCampaignApplications(campaignId);
  const { data: contentSubmissions, isLoading: contentLoading } = useContentSubmissions(campaignId);

  const campaignType = getCampaignType(campaign);

  // Access flat budget fields directly
  const totalCredits = campaign.totalCredits ?? 0;
  const creditsPerCustomer = campaign.creditsPerCustomer;
  const influencerSpots = campaign.influencerSpots ?? 0;
  const rewardValue = campaign.rewardValue;

  // Use pendingApplicationsCount from campaign if available, otherwise count from applications
  const pendingApplicationsCount = campaign.pendingApplicationsCount ?? (applications?.filter(app => app.status === 'pending').length || 0);

  const formatCampaignDate = (dateString: string | undefined): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, 'MMM d, yyyy');
  };

  const formatEventDateTime = (dateString: string | undefined): string | null => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return format(date, 'MMM d, yyyy • h:mm a');
  };

  // Process visits data for the chart
  const getVisitorChartData = () => {
    if (!visits || visits.length === 0) {
      return [];
    }

    // Group visits by date
    const visitsByDate = visits.reduce((acc, visit) => {
      const date = format(startOfDay(parseISO(visit.visitDate)), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { visits: 0 };
      }
      acc[date].visits += 1;
      return acc;
    }, {} as Record<string, { visits: number }>);

    // Convert to array and sort by date
    return Object.entries(visitsByDate)
      .map(([date, data]) => ({
        date,
        visits: data.visits,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  };

  return (
    <div className="space-y-8">
      {/* Top Section: Image + Campaign Details */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="grid lg:grid-cols-[400px_1fr]">
          {/* Campaign Image */}
          {campaign.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden lg:aspect-auto">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Campaign Details */}
          <div>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Tag className="mt-1 h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {getCampaignTypeLabel(campaignType)}
                  </p>
                </div>
              </div>

              <Separator />

              {campaignType === CampaignType.MEDIA_EVENT ? (
                <>
                  <div className="flex items-start gap-3">
                    <CalendarClock className="mt-1 h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Event Date & Time</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatEventDateTime(campaign.eventDate) || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <Eye className="mt-1 h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Event Type</p>
                      <Badge variant={campaign.visibility === 'public' ? 'default' : 'secondary'} className="mt-1">
                        {getEventTypeLabel(campaign.visibility)}
                      </Badge>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCampaignDate(campaign.periodStart) || 'Not set'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCampaignDate(campaign.periodEnd) || 'Not set'}
                    </p>
                  </div>
                </div>
              )}

              {campaign.requirements && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-500">Requirements & Guidelines</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {campaign.requirements}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </div>
        </div>
      </Card>

        {/* Metrics Grid - Campaign Type Specific */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Actual Visitors Card */}
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Actual Visitors
              </CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">{(metrics?.totalVisits ?? 0).toLocaleString()}</div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <UserCheck className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                      <span className="font-medium text-blue-600">From Influencers:</span>
                      <span className="font-bold text-gray-900">{(metrics?.influencerVisitorCount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <Smartphone className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-green-600">Direct from App:</span>
                      <span className="font-bold text-gray-900">{(metrics?.directAppVisitorCount ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Influencers Card */}
          <Card
            className="shadow-sm border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTabChange?.('influencers')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Influencers</CardTitle>
              <div className="rounded-full bg-purple-100 p-2">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading || applicationsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {metrics?.totalParticipants || 0}/{influencerSpots}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-gray-600">
                      Active influencers
                    </p>
                    {pendingApplicationsCount > 0 && (
                      <p className="text-xs text-orange-600 font-medium">
                        {pendingApplicationsCount} pending approval
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Content Card */}
          <Card
            className="shadow-sm border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTabChange?.('content')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Content</CardTitle>
              <div className="rounded-full bg-pink-100 p-2">
                <Camera className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              {contentLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {contentSubmissions?.length || 0}
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-gray-600">
                      Total submissions
                    </p>
                    {contentSubmissions && contentSubmissions.filter(s => s.status === 'new').length > 0 && (
                      <p className="text-xs text-orange-600 font-medium">
                        {contentSubmissions.filter(s => s.status === 'new').length} new
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Reward Value - Only shown for REWARDS campaigns */}
          {campaignType === CampaignType.LOYALTY_REWARD && (
            <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Reward Value
                </CardTitle>
                <div className="rounded-full bg-green-100 p-2">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900">
                      {(rewardValue || 0).toLocaleString()}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">per redemption</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Budget & Credit Breakdown - Conditional based on campaign type */}
        {shouldShowCreditBreakdown(campaign) && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle>Credit Breakdown</CardTitle>
              <CardDescription>Track your campaign spending and visitor attribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {metricsLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <>
                  {campaignType !== CampaignType.MEDIA_EVENT && (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Credits Used</span>
                        <span className="font-bold text-gray-900">
                          {(metrics?.totalCreditsSpent || 0).toLocaleString()} / {totalCredits.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{
                            width: `${totalCredits
                              ? Math.min(((metrics?.totalCreditsSpent || 0) / totalCredits) * 100, 100)
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Visitor Attribution Breakdown (matching iOS) */}
                  {metrics && (metrics.influencerVisitorCount > 0 || metrics.directAppVisitorCount > 0) && (
                    <div className="space-y-3 rounded-lg bg-gray-50 p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900">Visitor Attribution</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span className="text-gray-700">From Influencers</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {metrics.influencerVisitorCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-green-600" />
                            <span className="text-gray-700">Direct from App</span>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {metrics.directAppVisitorCount.toLocaleString()}
                          </span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span className="text-gray-900">Total Visitors</span>
                          <span className="text-gray-900">
                            {(metrics.influencerVisitorCount + metrics.directAppVisitorCount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6 sm:grid-cols-2">
                    {campaignType === CampaignType.MEDIA_EVENT ? (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Fixed Event Price</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {getMediaEventCredits()}
                        </p>
                        <p className="text-xs text-gray-500">credits per event</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Maximum Credit Spend</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {totalCredits.toLocaleString()}
                          </p>
                        </div>
                        {creditsPerCustomer && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Pay per Customer</p>
                            <p className="text-3xl font-bold text-gray-900">
                              {creditsPerCustomer.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">credits per visit</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* WEB-ONLY FEATURE: Charts - Visitors Over Time */}
        {/* iOS does not have any charts - this is a web-exclusive data visualization feature */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Visitors Over Time</CardTitle>
            <CardDescription>Daily visitor traffic to your campaign</CardDescription>
          </CardHeader>
          <CardContent>
            {visitsLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <VisitorTrafficChart data={getVisitorChartData()} />
            )}
          </CardContent>
        </Card>

        {/* Rewards Campaign Details */}
        {campaignType === CampaignType.LOYALTY_REWARD && (
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle>Reward Details</CardTitle>
              <CardDescription>Customer loyalty and rewards information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Reward Value</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(rewardValue || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">per redemption</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
