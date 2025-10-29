import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { campaignsApi } from '@/lib/api/campaigns';
import { CreateCampaignRequest, Campaign, CampaignStatus, CampaignType } from '@/lib/types/campaign';
import { useToast } from '@/components/ui/use-toast';

interface CreateCampaignData {
  campaignData: CreateCampaignRequest;
  imageFile?: File;
}

// Minimum credits per influencer constant
const MIN_CREDITS_PER_INFLUENCER = 150;

// Campaign API Payload Interface
interface CampaignPayload {
  title: string;
  description: string;
  campaignType: 'pay_per_customer' | 'pay_per_post' | 'media_event' | 'loyalty_reward';
  visibility: 'public' | 'private';
  status: 'active' | 'draft';
  requirements: string;
  influencerSpots: number;
  periodStart: string;
  periodEnd: string;
  creditsPerAction?: number;
  creditsPerCustomer?: number;
  totalCredits: number;
  imageUrl: string;
  eventDate?: string;
}

/**
 * Transform webapp CreateCampaignRequest to API payload format
 */
function transformToAPIPayload(data: CreateCampaignRequest, imageUrl: string): CampaignPayload {
  // Map campaign type to API campaign type
  const campaignTypeMap: Record<CampaignType, 'pay_per_customer' | 'pay_per_post' | 'media_event' | 'loyalty_reward'> = {
    [CampaignType.PAY_PER_CUSTOMER]: 'pay_per_customer',
    [CampaignType.PAY_PER_POST]: 'pay_per_post',
    [CampaignType.MEDIA_EVENT]: 'media_event',
    [CampaignType.LOYALTY_REWARD]: 'loyalty_reward',
  };

  const campaignType = campaignTypeMap[data.type];

  // Calculate creditsPerAction based on campaign type
  let creditsPerAction = 0;
  let totalCredits = data.totalCredits || 0;
  let influencerSpots = data.influencerSpots || 0;

  if (campaignType === 'pay_per_customer') {
    // For pay per customer: creditsPerAction is the cost per visit
    creditsPerAction = data.creditsPerCustomer || 0;
  } else if (campaignType === 'pay_per_post') {
    // For pay per post: creditsPerAction is the cost per post
    creditsPerAction = data.creditsPerAction || 0;
  } else if (campaignType === 'media_event') {
    // For media events: Force totalCredits to 300
    totalCredits = 300;
    // CRITICAL FIX #1: creditsPerAction calculation for media events
    // Match iOS implementation: divide 300 by influencerSpots
    creditsPerAction = Math.max(Math.floor(300 / Math.max(influencerSpots, 1)), 1);
  } else if (campaignType === 'loyalty_reward') {
    // For loyalty rewards: Force totalCredits, influencerSpots, and creditsPerAction to 0
    totalCredits = 0;
    influencerSpots = 0;
    creditsPerAction = 0;
  }

  // Requirements is already a string
  const requirementsString = data.requirements || '';

  // For loyalty reward campaigns, force visibility to public; otherwise use provided visibility
  const visibility = campaignType === 'loyalty_reward' ? 'public' : (data.visibility || 'public');

  // Media event date handling
  // For media events, use eventDate as start and add 6 hours for end
  let campaignStartDate: string;
  let campaignEndDate: string;

  if (campaignType === 'media_event' && data.eventDate) {
    // For media events, use eventDate as start and add 6 hours for end
    campaignStartDate = data.eventDate;
    const endDate = new Date(data.eventDate);
    endDate.setHours(endDate.getHours() + 6);
    campaignEndDate = endDate.toISOString();
  } else {
    // For other campaign types, use regular start/end dates
    campaignStartDate = data.periodStart;
    campaignEndDate = data.periodEnd;
  }

  return {
    title: data.title,
    description: data.description,
    campaignType,
    visibility,
    status: 'active',
    requirements: requirementsString,
    influencerSpots: influencerSpots || 0,
    periodStart: campaignStartDate,
    periodEnd: campaignEndDate,
    creditsPerAction: creditsPerAction || 0,
    creditsPerCustomer: campaignType === 'pay_per_customer' ? (data.creditsPerCustomer || 0) : undefined,
    totalCredits: totalCredits || 0,
    imageUrl: imageUrl || '',
    eventDate: campaignType === 'media_event' ? data.eventDate : undefined,
  };
}

export function useCreateCampaign() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ campaignData, imageFile }: CreateCampaignData): Promise<Campaign> => {
      let imageUrl = campaignData.imageUrl || '';

      // Upload image if provided
      if (imageFile) {
        try {
          const uploadResult = await campaignsApi.uploadImage(imageFile);
          imageUrl = uploadResult.url;
        } catch (error: any) {
          // Extract error message from response
          const errorMessage = error.response?.data?.error || error.message || 'Failed to upload image';

          // Show specific error toast for upload failure
          toast({
            title: 'Image Upload Failed',
            description: errorMessage,
            variant: 'destructive',
          });

          // Re-throw with a marker to prevent duplicate error toasts
          const uploadError: any = new Error(errorMessage);
          uploadError.isUploadError = true;
          throw uploadError;
        }
      }

      // Transform to API payload format
      const apiPayload = transformToAPIPayload(campaignData, imageUrl);

      // Create campaign with formatted payload
      const campaign = await campaignsApi.createCampaign(apiPayload);

      return campaign;
    },
    onSuccess: (campaign) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Invalidate credit balance to update the display
      queryClient.invalidateQueries({ queryKey: ['creditBalance'] });

      // Show success toast
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created and is now live!',
      });

      // Redirect to campaign detail or campaigns list
      router.push(`/campaigns/${campaign.id}`);
    },
    onError: (error: any) => {
      // Skip showing error toast if it's an upload error (already handled)
      if (error.isUploadError) {
        return;
      }

      let errorMessage = 'Failed to create campaign. Please try again.';

      // Check for specific error types
      if (error.response?.status === 400) {
        // 400 errors - check if insufficient credits
        const paymentType = error.config?.data?.paymentType;
        if (paymentType && paymentType !== 'rewards') {
          errorMessage = 'Insufficient credits to create this campaign. Please contact support for credit allocation.';
        } else {
          errorMessage = 'Failed to create campaign. Please check all required fields and try again.';
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You are not authorized to create campaigns. Please log in again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Campaign service not found. Please try again later.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.name === 'SyntaxError' || error.message?.includes('JSON')) {
        errorMessage = 'Failed to create campaign: Invalid response format';
      } else if (error.response?.data?.message) {
        errorMessage = `Failed to create campaign: ${error.response.data.message}`;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
}
