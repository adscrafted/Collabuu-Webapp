'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CampaignFormData, campaignFormSchema } from '@/lib/validation/campaign-schema';
import { CampaignType, CampaignStatus } from '@/lib/types/campaign';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { CampaignTypeStep } from '@/components/campaigns/steps/campaign-type-step';
import { BasicInfoStep } from '@/components/campaigns/steps/basic-info-step';
import { CampaignDetailsStep } from '@/components/campaigns/steps/campaign-details-step';
import { ReviewStep } from '@/components/campaigns/steps/review-step';
import { useCreateCampaign } from '@/lib/hooks/use-create-campaign';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 0, name: 'Campaign Type', description: 'Choose your campaign type' },
  { id: 1, name: 'Basic Info', description: 'Campaign details' },
  { id: 2, name: 'Budget & Schedule', description: 'Set budget and dates' },
  { id: 3, name: 'Review', description: 'Review and publish' },
];

export default function NewCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: CampaignType.PAY_PER_CUSTOMER,
      title: '',
      description: '',
      requirements: '',
      imageUrl: undefined,
      imageFile: undefined,
      visibility: 'public',
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      budget: {
        creditsPerCustomer: 25,
        influencerSpots: 3,
        totalCredits: 450, // 3 × 150 = 450 (minimum budget = influencerSpots × 150)
        rewardValue: 50,
      },
    },
    mode: 'onChange',
  });

  const createCampaign = useCreateCampaign();

  const handleNext = async () => {
    let isValid = false;

    // Validate current step
    switch (currentStep) {
      case 0:
        isValid = await form.trigger('type');
        break;
      case 1:
        isValid = await form.trigger(['title', 'description', 'requirements', 'imageUrl']);
        break;
      case 2:
        isValid = await form.trigger(['startDate', 'endDate', 'eventDate', 'budget', 'visibility']);
        break;
      case 3:
        isValid = true;
        break;
    }

    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const imageFile = data.imageFile;

    await createCampaign.mutateAsync({
      campaignData: {
        type: data.type,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        imageUrl: data.imageUrl,
        visibility: data.visibility,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString(),
        eventDate: data.eventDate?.toISOString(),
        budget: data.budget,
        status: CampaignStatus.ACTIVE, // Always create active campaigns like iOS
      },
      imageFile,
    });
  });

  const handleCancel = () => {
    router.push('/campaigns');
  };

  const isLoading = createCampaign.isPending;

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-8">
      {/* Header with Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Campaigns', href: '/campaigns' },
            { label: 'New Campaign' },
          ]}
          className="mb-3"
        />
        <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
        <p className="mt-2 text-sm text-gray-600">
          Launch your campaign in just a few simple steps
        </p>
      </div>

      {/* Stepper */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-colors',
                    currentStep === index
                      ? 'border-pink-500 bg-pink-500 text-white'
                      : currentStep > index
                        ? 'border-pink-500 bg-pink-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                  )}
                >
                  {currentStep > index ? (
                    <svg
                      className="h-6 w-6"
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
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="ml-3 hidden md:block">
                  <p
                    className={cn(
                      'text-sm font-semibold',
                      currentStep === index ? 'text-pink-600' : 'text-gray-500'
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-400">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-0.5 flex-1',
                    currentStep > index ? 'bg-pink-500' : 'bg-gray-300'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-8">
        <form onSubmit={handleSubmit}>
          {currentStep === 0 && <CampaignTypeStep form={form} />}
          {currentStep === 1 && <BasicInfoStep form={form} />}
          {currentStep === 2 && <CampaignDetailsStep form={form} availableCredits={10000} />}
          {currentStep === 3 && <ReviewStep form={form} onEditStep={handleEditStep} />}

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="border-2 border-gray-400 hover:border-gray-500"
              >
                Cancel
              </Button>
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={isLoading}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  <Rocket className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              )}
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
