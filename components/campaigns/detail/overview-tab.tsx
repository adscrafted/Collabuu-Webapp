'use client';

import { format, parseISO, startOfDay } from 'date-fns';
import { Calendar, Tag, TrendingUp, Users, CreditCard, Target, Smartphone, UserCheck, CalendarClock, Eye } from 'lucide-react';
import { useCampaignMetrics, useCampaignVisits } from '@/lib/hooks/use-campaign-detail';
import { Campaign, CampaignType } from '@/lib/types/campaign';
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
}

export function OverviewTab({ campaign, campaignId }: OverviewTabProps) {
  const { toast } = useToast();
  const { data: metrics, isLoading: metricsLoading } = useCampaignMetrics(campaignId);
  const { data: visits, isLoading: visitsLoading } = useCampaignVisits(campaignId);

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
        acc[date] = { visits: 0, views: 0 };
      }
      acc[date].visits += 1;
      return acc;
    }, {} as Record<string, { visits: number; views: number }>);

    // Convert to array and sort by date
    return Object.entries(visitsByDate)
      .map(([date, data]) => ({
        date,
        visits: data.visits,
        views: data.views,
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
                    {getCampaignTypeLabel(campaign.type)}
                  </p>
                </div>
              </div>

              <Separator />

              {campaign.type === CampaignType.MEDIA_EVENT ? (
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
                      {formatCampaignDate(campaign.startDate) || 'Not set'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCampaignDate(campaign.endDate) || 'Not set'}
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
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {/* Primary Metric - Changes based on campaign type */}
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {campaign.type === CampaignType.REWARDS
                  ? 'Actual Visitors'
                  : campaign.type === CampaignType.MEDIA_EVENT
                  ? 'Influencer Spots'
                  : 'Total Visitors'}
              </CardTitle>
              <div className="rounded-full bg-blue-100 p-2">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : campaign.type === CampaignType.MEDIA_EVENT ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {getInfluencerSpotsText(campaign) || '0 / 0'}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">spots filled</p>
                </>
              ) : campaign.type === CampaignType.REWARDS ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">{(metrics?.totalVisits ?? 0).toLocaleString()}</div>
                  <p className="mt-1 text-xs text-gray-600">customers visited</p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">{(metrics?.totalVisits ?? 0).toLocaleString()}</div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-600">
                        <UserCheck className="h-3.5 w-3.5" />
                        <span className="font-medium">From Influencers:</span>
                      </div>
                      <span className="font-bold text-gray-900">{(metrics?.influencerVisitorCount ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-green-600">
                        <Smartphone className="h-3.5 w-3.5" />
                        <span className="font-medium">Direct from App:</span>
                      </div>
                      <span className="font-bold text-gray-900">{(metrics?.directAppVisitorCount ?? 0).toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Participants - Hidden for REWARDS */}
          {campaign.type !== CampaignType.REWARDS && (
            <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Participants</CardTitle>
                <div className="rounded-full bg-purple-100 p-2">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900">{metrics?.totalParticipants || 0}</div>
                    <p className="mt-1 text-xs text-gray-600">
                      Active influencers
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Credits - Special handling for each type */}
          {campaign.type !== CampaignType.REWARDS && (
            <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {campaign.type === CampaignType.MEDIA_EVENT ? 'Event Credits' : 'Credits Spent'}
                </CardTitle>
                <div className="rounded-full bg-orange-100 p-2">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                {metricsLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : campaign.type === CampaignType.MEDIA_EVENT ? (
                  <>
                    <div className="text-3xl font-bold text-gray-900">
                      {getMediaEventCredits()}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">fixed price</p>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900">
                      {(metrics?.creditsSpent || 0).toLocaleString()}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      of {(campaign.budget?.totalCredits || 0).toLocaleString()} total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reward Value - Only shown for REWARDS campaigns */}
          {campaign.type === CampaignType.REWARDS && (
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
                      {(campaign.budget?.rewardValue || 0).toLocaleString()}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">per redemption</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

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
                  {campaign.type !== CampaignType.MEDIA_EVENT && (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">Credits Used</span>
                        <span className="font-bold text-gray-900">
                          {(metrics?.creditsSpent || 0).toLocaleString()} / {(campaign.budget?.totalCredits || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{
                            width: `${campaign.budget?.totalCredits
                              ? Math.min(((metrics?.creditsSpent || 0) / campaign.budget.totalCredits) * 100, 100)
                              : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6 sm:grid-cols-3">
                    {campaign.type === CampaignType.MEDIA_EVENT ? (
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
                            {(campaign.budget?.totalCredits || 0).toLocaleString()}
                          </p>
                        </div>
                        {campaign.budget?.creditsPerCustomer && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Pay per Customer</p>
                            <p className="text-3xl font-bold text-gray-900">
                              {campaign.budget.creditsPerCustomer.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">credits per visit</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Remaining Credits</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {((campaign.budget?.totalCredits || 0) - (metrics?.creditsSpent || 0)).toLocaleString()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {campaign.type !== CampaignType.MEDIA_EVENT && (
                    <>
                      <Separator />

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-4">Visitor Attribution Breakdown</h4>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                            <div className="rounded-full bg-blue-100 p-2 flex-shrink-0">
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-blue-900 mb-1">Total Visitors from Influencers</p>
                              <p className="text-2xl font-bold text-blue-900">{(metrics?.influencerVisitorCount ?? 0).toLocaleString()}</p>
                              <p className="text-xs text-blue-700 mt-1">
                                {metrics?.totalVisits
                                  ? `${(((metrics.influencerVisitorCount || 0) / metrics.totalVisits) * 100).toFixed(1)}%`
                                  : '0%'}{' '}
                                of total traffic
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-100">
                            <div className="rounded-full bg-green-100 p-2 flex-shrink-0">
                              <Smartphone className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-green-900 mb-1">Total Visitors Direct from App</p>
                              <p className="text-2xl font-bold text-green-900">{(metrics?.directAppVisitorCount ?? 0).toLocaleString()}</p>
                              <p className="text-xs text-green-700 mt-1">
                                {metrics?.totalVisits
                                  ? `${(((metrics.directAppVisitorCount || 0) / metrics.totalVisits) * 100).toFixed(1)}%`
                                  : '0%'}{' '}
                                of total traffic
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Rewards Campaign Details */}
        {campaign.type === CampaignType.REWARDS && (
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
                    {(campaign.budget?.rewardValue || 0).toLocaleString()}
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
