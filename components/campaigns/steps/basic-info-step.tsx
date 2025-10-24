'use client';

import { UseFormReturn } from 'react-hook-form';
import { CampaignFormData } from '@/lib/validation/campaign-schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUploader } from '../form/image-uploader';

interface BasicInfoStepProps {
  form: UseFormReturn<CampaignFormData>;
}

export function BasicInfoStep({ form }: BasicInfoStepProps) {
  const title = form.watch('title') || '';
  const description = form.watch('description') || '';
  const requirements = form.watch('requirements') || '';

  const handleImageChange = (file: File | null, previewUrl?: string) => {
    if (file) {
      form.setValue('imageFile', file, { shouldValidate: true });
      if (previewUrl) {
        form.setValue('imageUrl', previewUrl);
      }
    } else {
      form.setValue('imageFile', undefined);
      form.setValue('imageUrl', undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
        <p className="mt-2 text-sm text-gray-600">
          Tell influencers about your campaign and what makes it special
        </p>
      </div>

      <div className="space-y-6">
        {/* Campaign Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="title">
              Campaign Title <span className="text-red-500">*</span>
            </Label>
            <span
              className={`text-xs ${
                title.length > 100 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {title.length}/100
            </span>
          </div>
          <Input
            id="title"
            placeholder="Enter a compelling campaign title"
            {...form.register('title')}
            className={form.formState.errors.title ? 'border-red-500' : ''}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">
              {form.formState.errors.title.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Choose a clear, engaging title that describes your campaign
          </p>
        </div>

        {/* Campaign Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">
              Campaign Description <span className="text-red-500">*</span>
            </Label>
            <span
              className={`text-xs ${
                description.length > 1000 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {description.length}/1000
            </span>
          </div>
          <Textarea
            id="description"
            placeholder="Describe what your campaign is about, what you're offering, and what you expect from influencers"
            rows={6}
            {...form.register('description')}
            className={
              form.formState.errors.description ? 'border-red-500' : ''
            }
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">
              {form.formState.errors.description.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Include details about what you&apos;re offering, expectations, and any
            special requirements
          </p>
        </div>

        {/* Requirements & Guidelines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="requirements">
              Requirements & Guidelines <span className="text-red-500">*</span>
            </Label>
            <span
              className={`text-xs ${
                requirements.length < 10 || requirements.length > 2000 ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              {requirements.length}/2000
            </span>
          </div>
          <Textarea
            id="requirements"
            placeholder="Specify what influencers need to do, content guidelines, posting requirements, hashtags to use, etc."
            rows={6}
            {...form.register('requirements')}
            className={
              form.formState.errors.requirements ? 'border-red-500' : ''
            }
          />
          {form.formState.errors.requirements && (
            <p className="text-sm text-red-500">
              {form.formState.errors.requirements.message}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Please provide detailed requirements (10-2000 characters)
          </p>
        </div>

        {/* Campaign Image */}
        <div className="space-y-2">
          <Label htmlFor="image">
            Campaign Image <span className="text-red-500">*</span>
          </Label>
          <ImageUploader
            value={form.watch('imageUrl')}
            onChange={handleImageChange}
            error={form.formState.errors.imageUrl?.message}
          />
          <p className="text-xs text-gray-500">
            Select an eye-catching image for your campaign
          </p>
        </div>
      </div>

      {/* Tips Box */}
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Pro Tips</h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-inside list-disc space-y-1">
                <li>Use action words in your title to create excitement</li>
                <li>Be specific about what influencers will receive or do</li>
                <li>High-quality images get 3x more engagement</li>
                <li>Mention any unique selling points in your description</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
