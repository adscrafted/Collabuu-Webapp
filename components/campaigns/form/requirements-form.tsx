'use client';

import { UseFormReturn } from 'react-hook-form';
import { CampaignFormData } from '@/lib/validation/campaign-schema';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

interface RequirementsFormProps {
  form: UseFormReturn<CampaignFormData>;
}

export function RequirementsForm({ form }: RequirementsFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Campaign Requirements & Guidelines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="requirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Requirements</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter campaign requirements and guidelines for influencers...

Examples:
- Minimum 1000 followers
- Must use hashtag #YourBrand
- Must be located in San Francisco Bay Area
- Age range: 18-65
- Post must include product photo
- Must tag @yourbrand in the post"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-gray-500">
                Specify any requirements, guidelines, or instructions for influencers participating in this campaign.
                This can include follower count, hashtags, location, age restrictions, posting requirements, etc.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
