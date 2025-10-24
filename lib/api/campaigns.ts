import { apiClient } from './client';
import {
  Campaign,
  CampaignWithStats,
  CampaignListResponse,
  CreateCampaignRequest,
  CampaignFilters,
  CampaignStatus,
} from '@/lib/types/campaign';

// iOS API Payload Interface (matching backend expectations)
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

export const campaignsApi = {
  // Get all campaigns with filters
  getCampaigns: async (filters?: CampaignFilters): Promise<CampaignListResponse> => {
    const params = new URLSearchParams();

    if (filters?.status && filters.status.length > 0) {
      params.append('status', filters.status.join(','));
    }
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/api/business/campaigns${queryString ? `?${queryString}` : ''}`;

    // Backend returns an array of campaigns directly, not wrapped in a response object
    const response = await apiClient.get<any[]>(url);
    const campaigns = response.data;

    // Transform to match expected response format
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    return {
      campaigns: campaigns.map((campaign: any) => ({
        id: campaign.id,
        businessId: campaign.business_id || campaign.businessId,
        type: campaign.campaign_type || campaign.type,
        status: campaign.status,
        title: campaign.title,
        description: campaign.description,
        imageUrl: campaign.image_url || campaign.imageUrl || campaign.imageURL,
        startDate: campaign.start_date || campaign.periodStart,
        endDate: campaign.end_date || campaign.periodEnd,
        budget: {
          totalCredits: campaign.total_credits || campaign.totalCredits || 0,
          creditsPerCustomer: campaign.credits_per_customer || campaign.creditsPerCustomer || campaign.credits_per_action || campaign.creditsPerAction,
          creditsPerAction: campaign.credits_per_action || campaign.creditsPerAction,
          maxVisits: campaign.influencer_spots || campaign.influencerSpots,
          influencerSpots: campaign.influencer_spots || campaign.influencerSpots,
          rewardValue: campaign.reward_value || campaign.rewardValue,
        },
        requirements: campaign.requirements,
        visibility: campaign.visibility || 'public',
        createdAt: campaign.created_at || campaign.createdAt,
        updatedAt: campaign.updated_at || campaign.updatedAt,
        stats: {
          participantsCount: campaign.influencer_visitor_count || 0,
          visitsCount: campaign.visits || campaign.visitCount || 0,
          creditsSpent: (campaign.total_credits || 0) - (campaign.credits || 0),
        },
      })),
      total: campaigns.length,
      page,
      limit,
      totalPages: Math.ceil(campaigns.length / limit),
    };
  },

  // Get single campaign by ID
  getCampaign: async (id: string): Promise<CampaignWithStats> => {
    const response = await apiClient.get<CampaignWithStats>(`/api/business/campaigns/${id}`);
    return response.data;
  },

  // Create new campaign (accepts iOS-formatted payload)
  createCampaign: async (data: IOSCampaignPayload | CreateCampaignRequest): Promise<Campaign> => {
    // Send the payload directly to the API
    // If it's an iOS payload, it's already formatted correctly
    // If it's a CreateCampaignRequest, the caller should transform it first
    const response = await apiClient.post<Campaign>('/api/business/campaigns', data);
    return response.data;
  },

  // Update campaign
  updateCampaign: async (id: string, data: Partial<CreateCampaignRequest>): Promise<Campaign> => {
    const response = await apiClient.patch<Campaign>(`/api/business/campaigns/${id}`, data);
    return response.data;
  },

  // Update campaign status
  updateCampaignStatus: async (id: string, status: CampaignStatus): Promise<Campaign> => {
    const response = await apiClient.patch<Campaign>(`/api/business/campaigns/${id}/status`, { status });
    return response.data;
  },

  // Delete campaign
  deleteCampaign: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/business/campaigns/${id}`);
  },

  // Duplicate campaign
  duplicateCampaign: async (id: string): Promise<Campaign> => {
    const response = await apiClient.post<Campaign>(`/api/business/campaigns/${id}/duplicate`);
    return response.data;
  },

  // Upload campaign image
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/api/upload/campaign-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
