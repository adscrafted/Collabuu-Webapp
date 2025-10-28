'use client';

import { format } from 'date-fns';
import { Users, MapPin, Coins } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignWithStats, CampaignType, CampaignStatus, getCampaignType } from '@/lib/types/campaign';
import { cn, formatNumberWithCommas } from '@/lib/utils';

interface CampaignCardProps {
  campaign: CampaignWithStats;
}

const campaignTypeConfig = {
  [CampaignType.PAY_PER_CUSTOMER]: {
    label: 'Pay Per Customer',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [CampaignType.PAY_PER_POST]: {
    label: 'Pay Per Post',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  [CampaignType.MEDIA_EVENT]: {
    label: 'Media Event',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  [CampaignType.LOYALTY_REWARD]: {
    label: 'Loyalty Reward',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

const campaignStatusConfig = {
  [CampaignStatus.ACTIVE]: {
    label: 'Active',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  [CampaignStatus.PAUSED]: {
    label: 'Paused',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  [CampaignStatus.DRAFT]: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  [CampaignStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [CampaignStatus.CANCELLED]: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  [CampaignStatus.EXPIRED]: {
    label: 'Expired',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const campaignType = getCampaignType(campaign);

  const typeConfig = campaignTypeConfig[campaignType] || {
    label: campaignType || 'Unknown',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const statusConfig = campaignStatusConfig[campaign.status] || {
    label: campaign.status || 'Unknown',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  // Access flat budget fields directly
  const totalCredits = campaign.totalCredits ?? 0;
  const creditsSpent = campaign.stats?.creditsSpent ?? 0;
  const creditsRemaining = totalCredits - creditsSpent;

  const progress = totalCredits > 0
    ? (creditsSpent / totalCredits) * 100
    : 0;

  // Removed isExpired logic since backend now automatically updates status to 'expired'

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer h-full">
        {/* Campaign Image */}
        <div className="relative h-48 w-full bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt={campaign.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-6xl opacity-20">📸</div>
            </div>
          )}

          {/* Status Badge - Top Right */}
          <div className="absolute top-3 right-3">
            <Badge className={cn('border font-medium', statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">
          {/* Type Badge */}
          <div className="mb-3">
            <Badge className={cn('border text-xs font-medium', typeConfig.color)}>
              {typeConfig.label}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">
            {campaign.title}
          </h3>

          {/* Date Range */}
          <p className="text-sm text-gray-600 mb-4">
            {format(new Date(campaign.periodStart), 'MMM d')} - {format(new Date(campaign.periodEnd), 'MMM d, yyyy')}
          </p>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {formatNumberWithCommas(campaign.visitCount ?? campaign.stats?.visitsCount ?? 0)}
                </span>
              </div>
              <span className="text-xs text-gray-500">Visitors</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {formatNumberWithCommas(campaign.stats.participantsCount)}
                </span>
              </div>
              <span className="text-xs text-gray-500">Influencers</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1">
                <Coins className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">
                  {formatNumberWithCommas(creditsRemaining)}
                </span>
              </div>
              <span className="text-xs text-gray-500">Remaining</span>
            </div>
          </div>

          {/* Credits Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Credits</span>
              <span className="font-medium text-gray-900">
                {formatNumberWithCommas(creditsSpent)} / {formatNumberWithCommas(totalCredits)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  progress >= 90 ? 'bg-red-500' : progress >= 70 ? 'bg-amber-500' : 'bg-blue-500'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
