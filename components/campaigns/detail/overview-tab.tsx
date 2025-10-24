'use client';

import { format } from 'date-fns';
import { Calendar, Tag, TrendingUp, Users, CreditCard, Target, Clock, Smartphone, UserCheck, CalendarClock, Eye } from 'lucide-react';
import { useCampaignMetrics, useCampaignActivity } from '@/lib/hooks/use-campaign-detail';
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
import { AttributionPieChart } from '@/components/campaigns/charts/attribution-pie-chart';

interface OverviewTabProps {
  campaign: Campaign;
  campaignId: string;
}

export function OverviewTab({ campaign, campaignId }: OverviewTabProps) {
  const { toast } = useToast();
  const { data: metrics, isLoading: metricsLoading } = useCampaignMetrics(campaignId);
  const { data: activity, isLoading: activityLoading } = useCampaignActivity(campaignId);

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

  return (
    <div className="space-y-8">
      {/* Top Section: Image + Campaign Details */}
      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        {/* Campaign Image */}
        {campaign.imageUrl && (
          <Card className="h-full overflow-hidden shadow-sm border-gray-200">
            <CardContent className="h-full p-0 flex items-center justify-center">
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Details Card */}
        <Card className="shadow-sm border-gray-200">
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
        </Card>
      </div>

        {/* Metrics Grid - Campaign Type Specific */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
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
                      {metrics?.creditsSpent || 0}
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                      of {campaign.budget?.totalCredits || 0} total
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Conversion Rate or Reward Value */}
          <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {campaign.type === CampaignType.REWARDS ? 'Reward Value' : 'Conversion Rate'}
              </CardTitle>
              <div className="rounded-full bg-green-100 p-2">
                {campaign.type === CampaignType.REWARDS ? (
                  <Target className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : campaign.type === CampaignType.REWARDS ? (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {campaign.budget?.rewardValue || 0}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">per redemption</p>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-gray-900">
                    {metrics?.conversionRate ? `${metrics.conversionRate.toFixed(1)}%` : '0%'}
                  </div>
                  <p className="mt-1 text-xs text-gray-600">
                    Views to visits
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* WEB-ONLY FEATURE: Charts - Attribution Pie Chart */}
        {/* iOS does not have any charts - this is a web-exclusive data visualization feature */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Visitor Attribution</CardTitle>
            <CardDescription>Breakdown of visitor sources - influencer referrals vs direct app visitors</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : (
              <div className="space-y-6">
                <AttributionPieChart
                  data={[
                    {
                      source: 'influencer',
                      value: metrics?.influencerVisitorCount || 0,
                      percentage: metrics?.totalVisits
                        ? ((metrics.influencerVisitorCount || 0) / metrics.totalVisits) * 100
                        : 0,
                    },
                    {
                      source: 'direct',
                      value: metrics?.directAppVisitorCount || 0,
                      percentage: metrics?.totalVisits
                        ? ((metrics.directAppVisitorCount || 0) / metrics.totalVisits) * 100
                        : 0,
                    },
                  ]}
                />
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <p className="text-sm font-medium text-gray-700">Influencer Referrals</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{(metrics?.influencerVisitorCount ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {metrics?.totalVisits
                        ? `${(((metrics.influencerVisitorCount || 0) / metrics.totalVisits) * 100).toFixed(1)}%`
                        : '0%'}{' '}
                      of total visitors
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                      <p className="text-sm font-medium text-gray-700">Direct from App</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{(metrics?.directAppVisitorCount ?? 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      {metrics?.totalVisits
                        ? `${(((metrics.directAppVisitorCount || 0) / metrics.totalVisits) * 100).toFixed(1)}%`
                        : '0%'}{' '}
                      of total visitors
                    </p>
                  </div>
                </div>
              </div>
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
                          {metrics?.creditsSpent || 0} / {campaign.budget?.totalCredits || 0}
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
                            {campaign.budget?.totalCredits || 0}
                          </p>
                        </div>
                        {campaign.budget?.creditsPerCustomer && (
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">Pay per Customer</p>
                            <p className="text-3xl font-bold text-gray-900">
                              {campaign.budget.creditsPerCustomer}
                            </p>
                            <p className="text-xs text-gray-500">credits per visit</p>
                          </div>
                        )}
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Remaining Credits</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {(campaign.budget?.totalCredits || 0) - (metrics?.creditsSpent || 0)}
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
                    {campaign.budget?.rewardValue || 0}
                  </p>
                  <p className="text-xs text-gray-500">per redemption</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* WEB-ONLY FEATURE: Activity Timeline */}
        {/* iOS has only a placeholder for this - web has fully implemented activity timeline */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and events for this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-4">
                {activity.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 border border-blue-200">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      {index < activity.length - 1 && (
                        <div className="mt-2 h-full w-px bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.createdAt && !isNaN(new Date(item.createdAt).getTime())
                          ? format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')
                          : 'Date unavailable'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500">No activity yet</p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
