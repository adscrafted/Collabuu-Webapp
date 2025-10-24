'use client';

import { UseFormReturn } from 'react-hook-form';
import { CampaignFormData } from '@/lib/validation/campaign-schema';
import { CAMPAIGN_TYPE_OPTIONS, CampaignType } from '@/lib/types/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CampaignTypeStepProps {
  form: UseFormReturn<CampaignFormData>;
}

export function CampaignTypeStep({ form }: CampaignTypeStepProps) {
  const selectedType = form.watch('type');

  const handleSelectType = (type: CampaignType) => {
    form.setValue('type', type, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Campaign Type</h2>
        <p className="mt-2 text-sm text-gray-600">
          Select the type of campaign that best fits your marketing goals
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CAMPAIGN_TYPE_OPTIONS.map((option) => (
          <Card
            key={option.type}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-lg',
              selectedType === option.type
                ? 'border-2 border-pink-500 shadow-md'
                : 'border-2 border-transparent hover:border-gray-300'
            )}
            onClick={() => handleSelectType(option.type)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Icon */}
                <div className="flex items-center justify-center">
                  <div
                    className={cn(
                      'flex h-20 w-20 items-center justify-center rounded-full transition-colors',
                      selectedType === option.type
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-600'
                    )}
                  >
                    <option.icon className="h-10 w-10" />
                  </div>
                </div>

                {/* Title and Description */}
                <div className="space-y-2 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {option.title}
                  </h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>

                {/* Pricing Model */}
                <div
                  className={cn(
                    'rounded-lg p-3 text-center text-sm font-medium',
                    selectedType === option.type
                      ? 'bg-pink-50 text-pink-700'
                      : 'bg-gray-50 text-gray-700'
                  )}
                >
                  {option.pricingModel}
                  {option.fixedCredits && (
                    <span className="ml-1 font-bold">
                      ({option.fixedCredits} credits)
                    </span>
                  )}
                </div>

                {/* Example Use Case */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-500">{option.exampleUseCase}</p>
                </div>

                {/* Selected Indicator */}
                {selectedType === option.type && (
                  <div className="flex items-center justify-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Message */}
      {form.formState.errors.type && (
        <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
      )}
    </div>
  );
}
