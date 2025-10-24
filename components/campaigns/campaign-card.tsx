'use client';

import { format } from 'date-fns';
import { Users, Eye, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignWithStats, CampaignType, CampaignStatus } from '@/lib/types/campaign';
import { cn } from '@/lib/utils';

interface CampaignCardProps {
  campaign: CampaignWithStats;
}

const campaignTypeConfig = {
  [CampaignType.PAY_PER_CUSTOMER]: {
    label: 'Pay Per Customer',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  [CampaignType.MEDIA_EVENT]: {
    label: 'Media Event',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  [CampaignType.REWARDS]: {
    label: 'Rewards',
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
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const typeConfig = campaignTypeConfig[campaign.type] || {
    label: campaign.type || 'Unknown',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const statusConfig = campaignStatusConfig[campaign.status] || {
    label: campaign.status || 'Unknown',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const progress = campaign.budget.totalCredits > 0
    ? (campaign.stats.creditsSpent / campaign.budget.totalCredits) * 100
    : 0;

  const isExpired = new Date(campaign.endDate) < new Date() && campaign.status === CampaignStatus.ACTIVE;

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

          {/* Expired Overlay */}
          {isExpired && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-red-500 text-white border-red-600">
                Expired
              </Badge>
            </div>
          )}
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
            {format(new Date(campaign.startDate), 'MMM d')} - {format(new Date(campaign.endDate), 'MMM d, yyyy')}
          </p>

          {/* Metrics Row */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {campaign.stats.participantsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {campaign.stats.visitsCount}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                {campaign.stats.creditsSpent}
              </span>
            </div>
          </div>

          {/* Credits Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Credits</span>
              <span className="font-medium text-gray-900">
                {campaign.stats.creditsSpent} / {campaign.budget.totalCredits}
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
