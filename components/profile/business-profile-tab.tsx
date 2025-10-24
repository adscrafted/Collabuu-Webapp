'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useBusinessProfile, useUploadLogo } from '@/lib/hooks/use-profile';
import {
  businessProfileSchema,
  socialMediaSchema,
  BusinessProfileFormData,
  SocialMediaFormData,
} from '@/lib/validation/profile-schema';
import {
  COUNTRIES,
} from '@/lib/types/profile';
import { cn } from '@/lib/utils';

interface BusinessProfileTabProps {
  onFormChange?: (isDirty: boolean) => void;
  onSubmit?: (data: any) => Promise<void>;
}

export function BusinessProfileTab({ onFormChange, onSubmit }: BusinessProfileTabProps) {
  const { data: profile, isLoading } = useBusinessProfile();
  const uploadLogoMutation = useUploadLogo();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      businessName: '',
      phone: '',
      email: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    },
  });

  const socialMediaForm = useForm<SocialMediaFormData>({
    resolver: zodResolver(socialMediaSchema),
    defaultValues: {
      instagram: '',
      tiktok: '',
      youtube: '',
      facebook: '',
      twitter: '',
      linkedin: '',
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        businessName: profile.businessName,
        phone: profile.phone,
        email: profile.email,
        website: profile.website || '',
        address: profile.address,
      });

      socialMediaForm.reset(profile.socialMedia || {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]); // Only depend on profile to avoid infinite loops

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      // Show error toast
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      // Show error toast
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload logo
    try {
      await uploadLogoMutation.mutateAsync(file);
    } catch (error) {
      // Error is handled by the mutation's error state
    }
  };

  const handleFormSubmit = async (data: BusinessProfileFormData) => {
    const socialMedia = socialMediaForm.getValues();

    const completeData = {
      ...data,
      socialMedia,
    };

    await onSubmit?.(completeData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Logo Upload */}
      <div className="space-y-3">
        <Label>Business Logo</Label>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div
              className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200 cursor-pointer hover:border-pink-500 transition-colors"
              onClick={handleLogoClick}
            >
              {logoPreview || profile?.logoUrl ? (
                <Image
                  src={logoPreview || profile?.logoUrl || ''}
                  alt="Business logo"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            {uploadLogoMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleLogoClick}
              disabled={uploadLogoMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleLogoChange}
            />
            <p className="text-sm text-gray-500">
              Maximum file size: 2MB. Supported formats: JPEG, PNG, WebP
            </p>
          </div>
        </div>
      </div>

      {/* Business Information Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter business name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+1 (555) 123-4567" type="tel" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="business@example.com" type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://www.example.com" type="url" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Address</h3>

            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Main Street" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="New York" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="NY" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="address.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP/Postal Code *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="10001" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Social Media Section */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Social Media</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={socialMediaForm.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@yourbusiness" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={socialMediaForm.control}
                name="tiktok"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok Handle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@yourbusiness" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={socialMediaForm.control}
                name="youtube"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube Handle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@yourbusiness" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={socialMediaForm.control}
                name="facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Handle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@yourbusiness" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={socialMediaForm.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>X (Twitter) Handle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@yourbusiness" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={socialMediaForm.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Handle</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="@yourbusiness" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
