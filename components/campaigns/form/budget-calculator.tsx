'use client';

import { CampaignType } from '@/lib/types/campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface BudgetCalculatorProps {
  campaignType: CampaignType;
  creditsPerCustomer?: number;
  influencerSpots?: number;
  totalCredits?: number;
  rewardValue?: number;
  availableCredits: number;
}

export function BudgetCalculator({
  campaignType,
  creditsPerCustomer,
  influencerSpots,
  totalCredits = 0,
  rewardValue,
  availableCredits,
}: BudgetCalculatorProps) {
  const percentageOfAvailable = availableCredits > 0
    ? (totalCredits / availableCredits) * 100
    : 0;

  const isOverBudget = totalCredits > availableCredits;
  const isHighBudget = percentageOfAvailable > 80 && !isOverBudget;

  return (
    <Card className="border-2 border-pink-200 bg-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg text-pink-900">
          <TrendingUp className="mr-2 h-5 w-5" />
          Budget Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget Breakdown */}
        <div className="space-y-2">
          {campaignType === CampaignType.PAY_PER_CUSTOMER && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Credits per customer:</span>
                <span className="font-semibold text-gray-900">
                  {creditsPerCustomer || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Influencer spots:</span>
                <span className="font-semibold text-gray-900">
                  {influencerSpots || 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Minimum budget:</span>
                <span className="font-semibold text-gray-900">
                  {(influencerSpots || 0) * 150} credits
                </span>
              </div>
              {creditsPerCustomer && creditsPerCustomer > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Estimated customers:</span>
                  <span className="font-semibold text-gray-900">
                    {Math.floor(totalCredits / creditsPerCustomer)}
                  </span>
                </div>
              )}
            </>
          )}

          {campaignType === CampaignType.MEDIA_EVENT && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Fixed price:</span>
                <span className="font-semibold text-gray-900">300 credits</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Influencer spots:</span>
                <span className="font-semibold text-gray-900">
                  {influencerSpots || 0}
                </span>
              </div>
            </>
          )}

          {campaignType === CampaignType.REWARDS && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Campaign cost:</span>
              <span className="font-semibold text-green-600">
                No direct cost
              </span>
            </div>
          )}

          <div className="border-t border-pink-300 pt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total Credits:</span>
              <span className="text-xl font-bold text-pink-600">
                {totalCredits.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Available Credits */}
        <div className="rounded-lg bg-white p-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Available credits:</span>
            <span className="font-semibold text-gray-900">
              {availableCredits.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-700">Remaining after campaign:</span>
            <span
              className={`font-semibold ${
                isOverBudget ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {(availableCredits - totalCredits).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Warnings */}
        {isOverBudget && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have enough credits for this campaign. Please reduce the
              budget or purchase more credits.
            </AlertDescription>
          </Alert>
        )}

        {isHighBudget && (
          <Alert className="border-amber-500 bg-amber-50 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This campaign will use {percentageOfAvailable.toFixed(0)}% of your
              available credits. Make sure you have enough for other campaigns.
            </AlertDescription>
          </Alert>
        )}

      </CardContent>
    </Card>
  );
}
