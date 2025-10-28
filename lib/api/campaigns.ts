import { apiClient } from './client';
import {
  Campaign,
  CampaignWithStats,
  CampaignListResponse,
  CreateCampaignRequest,
  CampaignFilters,
  CampaignStatus,
} from '@/lib/types/campaign';

// Campaign API Payload Interface (matching backend expectations)
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
        businessId: campaign.businessId,
        type: campaign.type,
        status: campaign.status,
        title: campaign.title,
        description: campaign.description,
        imageUrl: campaign.imageUrl,

        // Date fields (both formats for compatibility)
        periodStart: campaign.periodStart,
        periodEnd: campaign.periodEnd,
        startDate: campaign.periodStart, // Backward compatibility
        endDate: campaign.periodEnd,     // Backward compatibility

        // Flat budget fields (iOS-compatible)
        totalCredits: campaign.totalCredits || 0,
        creditsPerCustomer: campaign.creditsPerCustomer,
        creditsPerAction: campaign.creditsPerAction,
        maxVisits: campaign.maxVisits,
        influencerSpots: campaign.influencerSpots,
        influencerSpotsFilled: campaign.influencerSpotsFilled || 0,
        rewardValue: campaign.rewardValue,
        visitCount: campaign.visitCount || 0,
        influencerVisitorCount: campaign.influencerVisitorCount || 0,
        directAppVisitorCount: campaign.directAppVisitorCount || 0,
        pendingApplicationsCount: campaign.pendingApplicationsCount || 0,

        requirements: campaign.requirements,
        visibility: campaign.visibility || 'public',
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
        stats: campaign.stats || {
          participantsCount: 0,
          visitsCount: campaign.visitCount || 0,
          creditsSpent: 0,
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
    const response = await apiClient.get<any>(`/api/business/campaigns/${id}`);
    const campaign = response.data;

    // Transform to match expected Campaign format (iOS-compatible)
    return {
      id: campaign.id,
      businessId: campaign.businessId,
      type: campaign.type,
      status: campaign.status,
      title: campaign.title,
      description: campaign.description,
      imageUrl: campaign.imageUrl,

      // Date fields (both formats for compatibility)
      periodStart: campaign.periodStart,
      periodEnd: campaign.periodEnd,
      startDate: campaign.periodStart, // Backward compatibility
      endDate: campaign.periodEnd,     // Backward compatibility
      eventDate: campaign.eventDate,

      // Flat budget fields (iOS-compatible)
      totalCredits: campaign.totalCredits || 0,
      creditsPerCustomer: campaign.creditsPerCustomer,
      creditsPerAction: campaign.creditsPerAction,
      maxVisits: campaign.maxVisits,
      influencerSpots: campaign.influencerSpots,
      influencerSpotsFilled: campaign.influencerSpotsFilled || 0,
      rewardValue: campaign.rewardValue,
      visitCount: campaign.visitCount || 0,
      influencerVisitorCount: campaign.influencerVisitorCount || 0,
      directAppVisitorCount: campaign.directAppVisitorCount || 0,
      pendingApplicationsCount: campaign.pendingApplicationsCount || 0,

      requirements: campaign.requirements,
      visibility: campaign.visibility || 'public',
      shareLink: campaign.shareLink,
      influencerCount: campaign.influencerCount,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      stats: campaign.stats || {
        participantsCount: 0,
        visitsCount: campaign.visitCount || 0,
        creditsSpent: 0,
      },
    };
  },

  // Create new campaign
  createCampaign: async (data: CampaignPayload | CreateCampaignRequest): Promise<Campaign> => {
    // Send the payload directly to the API
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
