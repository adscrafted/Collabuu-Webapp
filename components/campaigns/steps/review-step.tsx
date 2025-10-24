'use client';

import { format } from 'date-fns';
import { UseFormReturn } from 'react-hook-form';
import { CampaignFormData } from '@/lib/validation/campaign-schema';
import { CAMPAIGN_TYPE_OPTIONS, CampaignType } from '@/lib/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit2 } from 'lucide-react';

interface ReviewStepProps {
  form: UseFormReturn<CampaignFormData>;
  onEditStep: (step: number) => void;
}

export function ReviewStep({ form, onEditStep }: ReviewStepProps) {
  const formData = form.watch();
  const campaignTypeOption = CAMPAIGN_TYPE_OPTIONS.find(
    (opt) => opt.type === formData.type
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Review & Publish</h2>
        <p className="mt-2 text-sm text-gray-600">
          Review your campaign details before publishing
        </p>
      </div>

      <div className="space-y-4">
        {/* Campaign Type */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Campaign Type
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(0)}
            >
              <Edit2 className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                {campaignTypeOption?.icon && <campaignTypeOption.icon className="h-6 w-6" />}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {campaignTypeOption?.title}
                </p>
                <p className="text-sm text-gray-600">
                  {campaignTypeOption?.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Basic Information
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
            >
              <Edit2 className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.imageUrl && (
              <div className="overflow-hidden rounded-lg">
                <img
                  src={formData.imageUrl}
                  alt="Campaign preview"
                  className="h-48 w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Title</p>
              <p className="mt-1 text-base font-semibold text-gray-900">
                {formData.title}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="mt-1 text-sm text-gray-700">{formData.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Campaign Details
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
            >
              <Edit2 className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Schedule */}
            <div>
              <p className="text-sm font-medium text-gray-500">Schedule</p>
              <div className="mt-1 text-sm text-gray-900">
                {formData.type === CampaignType.MEDIA_EVENT ? (
                  <p>
                    <span className="font-semibold">Event:</span>{' '}
                    {formData.eventDate && format(formData.eventDate, 'PPP p')}
                  </p>
                ) : (
                  <>
                    <p>
                      <span className="font-semibold">Start:</span>{' '}
                      {formData.startDate && format(formData.startDate, 'PPP')}
                    </p>
                    <p>
                      <span className="font-semibold">End:</span>{' '}
                      {formData.endDate && format(formData.endDate, 'PPP')}
                    </p>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Budget */}
            <div>
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <div className="mt-2 space-y-2 text-sm">
                {formData.type === CampaignType.PAY_PER_CUSTOMER && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Credits per customer:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.budget.creditsPerCustomer}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Influencer spots:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.budget.influencerSpots}
                      </span>
                    </div>
                  </>
                )}

                {formData.type === CampaignType.MEDIA_EVENT && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fixed price:</span>
                      <span className="font-semibold text-gray-900">
                        300 credits
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Influencer spots:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.budget.influencerSpots}
                      </span>
                    </div>
                  </>
                )}

                {formData.type === CampaignType.REWARDS && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reward value:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.budget.rewardValue} credits
                    </span>
                  </div>
                )}

                <Separator />
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-900">
                    Total Credits:
                  </span>
                  <span className="font-bold text-pink-600">
                    {formData.budget.totalCredits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            {formData.requirements && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Requirements & Guidelines
                  </p>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {formData.requirements}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
