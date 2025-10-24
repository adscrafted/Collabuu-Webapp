'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, X, Trash2 } from 'lucide-react';
import { useCampaign, useUpdateCampaign, useDeleteCampaign } from '@/lib/hooks/use-campaign-detail';
import { CampaignType } from '@/lib/types/campaign';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const editCampaignSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  requirements: z.string().trim().min(1, 'Requirements are required'),
  startDate: z.string(),
  endDate: z.string(),
});

type EditCampaignFormData = z.infer<typeof editCampaignSchema>;

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const campaignId = params.id as string;

  // Queries
  const { data: campaign, isLoading } = useCampaign(campaignId);
  const updateCampaign = useUpdateCampaign(campaignId);
  const deleteCampaign = useDeleteCampaign();

  // Delete confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const form = useForm<EditCampaignFormData>({
    resolver: zodResolver(editCampaignSchema),
    defaultValues: {
      title: '',
      description: '',
      requirements: '',
      startDate: '',
      endDate: '',
    },
  });

  // Populate form when campaign data loads
  useEffect(() => {
    if (campaign) {
      form.reset({
        title: campaign.title || '',
        description: campaign.description || '',
        requirements: campaign.requirements || '',
        startDate: campaign.startDate?.split('T')[0] || '',
        endDate: campaign.endDate?.split('T')[0] || '',
      });
    }
  }, [campaign, form]);

  // Check if dates can be edited (only if they haven't passed yet)
  const canEditStartDate = campaign?.startDate
    ? new Date(campaign.startDate) > new Date()
    : true;

  const canEditEndDate = campaign?.endDate
    ? new Date(campaign.endDate) > new Date()
    : true;

  // Check if campaign can be deleted (matching iOS logic)
  const canDeleteCampaign = campaign
    ? (campaign.startDate ? new Date(campaign.startDate) > new Date() : true) &&
      (campaign.influencerCount ?? 0) === 0
    : false;

  const deleteDisabledReason = campaign
    ? !canDeleteCampaign
      ? campaign.startDate && new Date(campaign.startDate) <= new Date()
        ? "Cannot delete campaign that has already started"
        : "Cannot delete campaign with accepted influencers"
      : undefined
    : undefined;

  // Convert date-only string to ISO8601 format (matching iOS)
  const toISO8601 = (dateString: string): string => {
    if (!dateString) return dateString;
    // Input: "YYYY-MM-DD" from HTML date input
    // Output: "YYYY-MM-DDT00:00:00Z" (ISO8601 format matching iOS)
    return `${dateString}T00:00:00Z`;
  };

  const onSubmit = async (data: EditCampaignFormData) => {
    try {
      await updateCampaign.mutateAsync({
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        period_start: toISO8601(data.startDate),
        period_end: toISO8601(data.endDate),
      });

      toast({
        title: 'Campaign Updated',
        description: 'Your changes have been saved successfully',
      });

      router.push(`/campaigns/${campaignId}`);
    } catch (error: any) {
      // Handle specific error cases like iOS
      let errorMessage = 'Failed to update campaign';

      if (error?.response?.status === 401 || error?.response?.status === 403) {
        errorMessage = "You don't have permission to edit this campaign. The campaign may have already started or you may not be the owner.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Campaign not found. It may have been deleted.";
      } else if (error?.response?.status >= 400 && error?.response?.status < 500) {
        errorMessage = `Failed to update campaign (Error ${error.response.status}). Please check your input and try again.`;
      } else if (error?.response?.status >= 500 && error?.response?.status < 600) {
        errorMessage = `Server error (${error.response.status}). Please try again later.`;
      } else if (error?.message === 'Network Error' || !error?.response) {
        errorMessage = "Network error. Please check your connection and try again.";
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDiscard = () => {
    if (form.formState.isDirty) {
      if (confirm('Are you sure you want to discard your changes?')) {
        router.push(`/campaigns/${campaignId}`);
      }
    } else {
      router.push(`/campaigns/${campaignId}`);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCampaign.mutateAsync(campaignId);

      toast({
        title: 'Campaign Deleted',
        description: 'Your credits have been refunded to your account.',
      });

      router.push('/campaigns');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete campaign',
        variant: 'destructive',
      });
    }
    setShowDeleteConfirmation(false);
  };

  const getCampaignTypeLabel = (type: CampaignType) => {
    const labels = {
      [CampaignType.PAY_PER_CUSTOMER]: 'Pay Per Customer',
      [CampaignType.MEDIA_EVENT]: 'Media Event',
      [CampaignType.REWARDS]: 'Rewards',
    };
    return labels[type];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-white p-12 text-center shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Campaign Not Found</h2>
        <p className="mb-6 text-gray-600">
          The campaign you're trying to edit doesn't exist.
        </p>
        <Button onClick={() => router.push('/campaigns')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Campaigns', href: '/campaigns' },
            { label: campaign.title || 'Edit Campaign' },
          ]}
          className="mb-3"
        />
        <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
        <p className="mt-1 text-gray-600">Update your campaign details</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Campaign Type (Read-only) */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Type</CardTitle>
              <CardDescription>Campaign type cannot be changed after creation</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-base">
                {getCampaignTypeLabel(campaign.type)}
              </Badge>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your campaign's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter campaign title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What are the requirements for influencers?"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Campaign Duration */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Duration</CardTitle>
              <CardDescription>Set the start and end dates for your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={!canEditStartDate} />
                      </FormControl>
                      {!canEditStartDate && (
                        <p className="text-sm text-muted-foreground">
                          Cannot edit - date has passed
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={!canEditEndDate} />
                      </FormControl>
                      {!canEditEndDate && (
                        <p className="text-sm text-muted-foreground">
                          Cannot edit - date has passed
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Delete Campaign Section - matching iOS */}
          {(canDeleteCampaign || deleteDisabledReason) && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Campaign</CardTitle>
                <CardDescription>
                  Permanently delete this campaign and refund credits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deleteDisabledReason && (
                  <div className="flex items-start gap-2 rounded-lg bg-muted p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-muted-foreground mt-0.5"
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
                    <p className="text-sm text-muted-foreground">{deleteDisabledReason}</p>
                  </div>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={!canDeleteCampaign || deleteCampaign.isPending}
                  className="w-full"
                >
                  {deleteCampaign.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Campaign
                    </>
                  )}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Deleting this campaign will refund the credits to your account.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDiscard}
              disabled={updateCampaign.isPending}
            >
              <X className="mr-2 h-4 w-4" />
              Discard Changes
            </Button>
            <Button type="submit" disabled={updateCampaign.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {updateCampaign.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Delete Confirmation Dialog - matching iOS */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
