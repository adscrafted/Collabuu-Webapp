'use client';

import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CampaignFormData } from '@/lib/validation/campaign-schema';
import { CampaignType } from '@/lib/types/campaign';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateRangePicker } from '../form/date-range-picker';
import { BudgetCalculator } from '../form/budget-calculator';

interface CampaignDetailsStepProps {
  form: UseFormReturn<CampaignFormData>;
  availableCredits?: number;
}

export function CampaignDetailsStep({
  form,
  availableCredits = 10000,
}: CampaignDetailsStepProps) {
  const campaignType = form.watch('type');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  const visibility = form.watch('visibility') || 'public';
  const creditsPerCustomer = form.watch('budget.creditsPerCustomer');
  const influencerSpots = form.watch('budget.influencerSpots');
  const totalCredits = form.watch('budget.totalCredits');
  const rewardValue = form.watch('budget.rewardValue');

  // Force visibility to public for rewards campaigns
  React.useEffect(() => {
    if (campaignType === CampaignType.REWARDS) {
      form.setValue('visibility', 'public');
    }
  }, [campaignType]);

  // Auto-set budget values for media events and rewards campaigns
  React.useEffect(() => {
    if (campaignType === CampaignType.MEDIA_EVENT) {
      form.setValue('budget.totalCredits', 300);
    } else if (campaignType === CampaignType.REWARDS) {
      form.setValue('budget.totalCredits', 0);
      form.setValue('budget.influencerSpots', 0);
    }
  }, [campaignType]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Campaign Details</h2>
        <p className="mt-2 text-sm text-gray-600">
          Set your campaign schedule, budget, and requirements
        </p>
      </div>

      <div className="space-y-6">
        {/* Visibility Toggle */}
        {campaignType !== CampaignType.REWARDS && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={visibility}
                onValueChange={(value) =>
                  form.setValue('visibility', value as 'public' | 'private', {
                    shouldValidate: true,
                  })
                }
              >
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex-1 cursor-pointer">
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-gray-500">
                      Visible to all influencers in the marketplace
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex-1 cursor-pointer">
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-gray-500">
                      Only visible to invited influencers
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Date Range - Only show for non-media-event campaigns */}
        {campaignType !== CampaignType.MEDIA_EVENT && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) =>
                  form.setValue('startDate', date || new Date(), {
                    shouldValidate: true,
                  })
                }
                onEndDateChange={(date) =>
                  form.setValue('endDate', date || new Date(), {
                    shouldValidate: true,
                  })
                }
                startDateError={form.formState.errors.startDate?.message}
                endDateError={form.formState.errors.endDate?.message}
              />
            </CardContent>
          </Card>
        )}

        {/* Budget Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaignType === CampaignType.PAY_PER_CUSTOMER && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="creditsPerCustomer">
                    Credits Per Customer <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="creditsPerCustomer"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="e.g., 25"
                    {...form.register('budget.creditsPerCustomer', {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.budget?.creditsPerCustomer && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.budget.creditsPerCustomer.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    How many credits to give customers when they visit through an influencer
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="influencerSpots">
                    Influencer Spots <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="influencerSpots"
                    type="number"
                    min="1"
                    placeholder="e.g., 3"
                    {...form.register('budget.influencerSpots', {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.budget?.influencerSpots && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.budget.influencerSpots.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    How many influencers can participate?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalCredits">
                    Max Budget (Credits) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalCredits"
                    type="number"
                    min="1"
                    max="1000000"
                    placeholder="e.g., 450"
                    {...form.register('budget.totalCredits', {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.budget?.totalCredits && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.budget.totalCredits.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Maximum credits you&apos;re willing to spend on this campaign
                  </p>
                </div>

                {influencerSpots && totalCredits && totalCredits < influencerSpots * 150 && (
                  <div className="rounded-lg bg-amber-50 p-4">
                    <div className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-amber-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-amber-900">
                          Minimum Budget: {influencerSpots * 150} credits
                        </p>
                        <p className="text-xs text-amber-700">
                          Based on {influencerSpots} spots × 150 credits minimum per influencer
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {campaignType === CampaignType.MEDIA_EVENT && (
              <>
                <div className="rounded-lg bg-pink-50 p-4">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-pink-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-pink-900">
                        Fixed Price: 300 Credits
                      </p>
                      <p className="text-xs text-pink-700">
                        Media events have a standard fixed price
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">
                    Event Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="eventDate"
                    type="datetime-local"
                    {...form.register('eventDate', {
                      setValueAs: (value) => value ? new Date(value) : undefined,
                    })}
                    className={
                      form.formState.errors.eventDate ? 'border-red-500' : ''
                    }
                  />
                  {form.formState.errors.eventDate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.eventDate.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    When will your event take place?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="influencerSpots">
                    Influencer Spots <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="influencerSpots"
                    type="number"
                    min="1"
                    max="50"
                    placeholder="e.g., 5"
                    {...form.register('budget.influencerSpots', {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.budget?.influencerSpots && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.budget.influencerSpots.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Number of influencers you want to invite to your event
                  </p>
                </div>
              </>
            )}

            {campaignType === CampaignType.REWARDS && (
              <>
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-green-900">
                        No Direct Cost
                      </p>
                      <p className="text-xs text-green-700">
                        Rewards campaigns have no direct cost. Participants earn through reward program.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardValue">
                    Reward Value (Credits) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rewardValue"
                    type="number"
                    min="1"
                    placeholder="e.g., 50"
                    {...form.register('budget.rewardValue', {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.budget?.rewardValue && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.budget.rewardValue.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Credit value for each redemption
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <BudgetCalculator
          campaignType={campaignType}
          creditsPerCustomer={creditsPerCustomer}
          influencerSpots={influencerSpots}
          totalCredits={totalCredits}
          rewardValue={rewardValue}
          availableCredits={availableCredits}
        />
      </div>
    </div>
  );
}
