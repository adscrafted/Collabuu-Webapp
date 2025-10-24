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

// iOS API Payload Interface
interface IOSCampaignPayload {
  title: string;
  description: string;
  paymentType: 'pay_per_customer' | 'media_event' | 'rewards';
  visibility: 'public' | 'private';
  status: 'active' | 'draft';
  requirements: string;
  influencerSpots: number;
  periodStart: string;
  periodEnd: string;
  creditsPerAction: number;
  creditsPerCustomer?: number;
  totalCredits: number;
  imageUrl: string;
}

/**
 * Transform webapp CreateCampaignRequest to iOS API payload format
 */
function transformToIOSPayload(data: CreateCampaignRequest, imageUrl: string): IOSCampaignPayload {
  // Map campaign type to iOS payment type
  const paymentTypeMap: Record<CampaignType, 'pay_per_customer' | 'media_event' | 'rewards'> = {
    [CampaignType.PAY_PER_CUSTOMER]: 'pay_per_customer',
    [CampaignType.MEDIA_EVENT]: 'media_event',
    [CampaignType.REWARDS]: 'rewards',
  };

  const paymentType = paymentTypeMap[data.type];

  // Calculate creditsPerAction based on campaign type
  let creditsPerAction = 0;
  let totalCredits = data.budget.totalCredits || 0;
  let influencerSpots = data.budget.influencerSpots || data.budget.maxVisits || 0;

  if (paymentType === 'pay_per_customer') {
    // For pay per customer: creditsPerAction is the cost per visit
    creditsPerAction = data.budget.creditsPerCustomer || 0;
  } else if (paymentType === 'media_event') {
    // For media events: Force totalCredits to 300
    totalCredits = 300;
    // CRITICAL FIX #1: creditsPerAction calculation for media events
    // Match iOS implementation: divide 300 by influencerSpots
    creditsPerAction = Math.max(Math.floor(300 / Math.max(influencerSpots, 1)), 1);
  } else if (paymentType === 'rewards') {
    // For rewards: Force totalCredits, influencerSpots, and creditsPerAction to 0 (matching iOS)
    totalCredits = 0;
    influencerSpots = 0;
    creditsPerAction = 0;  // iOS always sets this to 0 for rewards
  }

  // Requirements is already a string
  const requirementsString = data.requirements || '';

  // For rewards campaigns, force visibility to public; otherwise use provided visibility
  const visibility = paymentType === 'rewards' ? 'public' : (data.visibility || 'public');

  // CRITICAL FIX #2: Media event date handling
  // For media events, use eventDate as start and add 6 hours for end (matching iOS)
  let campaignStartDate: string;
  let campaignEndDate: string;

  if (paymentType === 'media_event' && data.eventDate) {
    // For media events, use eventDate as start and add 6 hours for end
    campaignStartDate = data.eventDate;
    const endDate = new Date(data.eventDate);
    endDate.setHours(endDate.getHours() + 6);
    campaignEndDate = endDate.toISOString();
  } else {
    // For other campaign types, use regular start/end dates
    campaignStartDate = data.startDate;
    campaignEndDate = data.endDate;
  }

  return {
    title: data.title,
    description: data.description,
    paymentType,
    visibility,
    status: 'active', // iOS always creates active campaigns
    requirements: requirementsString,
    influencerSpots: influencerSpots || 0,
    periodStart: campaignStartDate,
    periodEnd: campaignEndDate,
    creditsPerAction: creditsPerAction || 0,
    creditsPerCustomer: paymentType === 'pay_per_customer' ? (data.budget.creditsPerCustomer || 0) : undefined,
    totalCredits: totalCredits || 0,
    imageUrl: imageUrl || '',
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
        const uploadResult = await campaignsApi.uploadImage(imageFile);
        imageUrl = uploadResult.url;
      }

      // Transform to iOS payload format
      const iosPayload = transformToIOSPayload(campaignData, imageUrl);

      // Create campaign with iOS-formatted payload
      const campaign = await campaignsApi.createCampaign(iosPayload);

      return campaign;
    },
    onSuccess: (campaign) => {
      // Invalidate campaigns list
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Show success toast
      toast({
        title: 'Campaign Created',
        description: 'Your campaign has been created and is now live!',
      });

      // Redirect to campaign detail or campaigns list
      router.push(`/campaigns/${campaign.id}`);
    },
    onError: (error: any) => {
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
