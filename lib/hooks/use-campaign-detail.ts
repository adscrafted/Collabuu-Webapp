import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  Campaign,
  CampaignMetrics,
  InfluencerApplication,
  CampaignParticipant,
  Visit,
  CampaignActivity,
  UpdateCampaignRequest,
  AcceptApplicationRequest,
  RejectApplicationRequest,
  RemoveParticipantRequest,
  DateRange,
  CampaignStatus,
  ContentSubmission,
} from '@/lib/types/campaign';

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  detail: (id: string) => [...campaignKeys.all, 'detail', id] as const,
  metrics: (id: string) => [...campaignKeys.all, 'metrics', id] as const,
  applications: (id: string) => [...campaignKeys.all, 'applications', id] as const,
  participants: (id: string) => [...campaignKeys.all, 'participants', id] as const,
  visits: (id: string) => [...campaignKeys.all, 'visits', id] as const,
  activity: (id: string) => [...campaignKeys.all, 'activity', id] as const,
  contentSubmissions: (id: string) => [...campaignKeys.all, 'content-submissions', id] as const,
};

// Fetch campaign by ID
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<Campaign>(`/api/business/campaigns/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Fetch campaign metrics
export function useCampaignMetrics(id: string) {
  return useQuery({
    queryKey: campaignKeys.metrics(id),
    queryFn: async () => {
      const response = await apiClient.get<CampaignMetrics>(`/api/business/campaigns/${id}/metrics`);
      return response.data;
    },
    enabled: !!id,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Fetch campaign applications
export function useCampaignApplications(id: string) {
  return useQuery({
    queryKey: campaignKeys.applications(id),
    queryFn: async () => {
      const response = await apiClient.get<InfluencerApplication[]>(
        `/api/business/campaigns/${id}/applications`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Fetch campaign participants
export function useCampaignParticipants(id: string) {
  return useQuery({
    queryKey: campaignKeys.participants(id),
    queryFn: async () => {
      const response = await apiClient.get<any[]>(
        `/api/business/campaigns/${id}/participants`
      );

      // Transform the response to ensure customer/visit counts are available
      return response.data.map((participant: any) => ({
        id: participant.id,
        campaignId: participant.campaign_id || participant.campaignId || id,
        userId: participant.user_id || participant.userId || participant.influencer_id || participant.influencerId,
        influencerName: participant.influencer_name || participant.influencerName || 'Unknown',
        influencerAvatar: participant.influencer_avatar || participant.influencerAvatar,
        followerCount: participant.follower_count || participant.followerCount || 0,
        joinedAt: participant.joined_at || participant.joinedAt || participant.created_at || participant.createdAt,
        visitsGenerated: participant.visits_generated || participant.visitsGenerated || participant.visit_count || participant.visitCount || 0,
        conversions: participant.conversions || 0,
        creditsEarned: participant.credits_earned || participant.creditsEarned || 0,
        conversionRate: participant.conversion_rate || participant.conversionRate || 0,
        lastActivityAt: participant.last_activity_at || participant.lastActivityAt,
        // New fields for customer/visit tracking
        visitCount: participant.visit_count || participant.visitCount || participant.visits_generated || participant.visitsGenerated || 0,
        customerCount: participant.customer_count || participant.customerCount || participant.unique_customers || participant.uniqueCustomers,
      })) as CampaignParticipant[];
    },
    enabled: !!id,
  });
}

// Fetch visit history
export function useCampaignVisits(id: string) {
  return useQuery({
    queryKey: campaignKeys.visits(id),
    queryFn: async () => {
      const response = await apiClient.get<Visit[]>(`/api/business/campaigns/${id}/visits`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Fetch campaign activity
export function useCampaignActivity(id: string) {
  return useQuery({
    queryKey: campaignKeys.activity(id),
    queryFn: async () => {
      const response = await apiClient.get<CampaignActivity[]>(`/api/business/campaigns/${id}/activity`);
      return response.data;
    },
    enabled: !!id,
  });
}

// Update campaign
export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCampaignRequest) => {
      const response = await apiClient.put<Campaign>(`/api/business/campaigns/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// Update campaign status
export function useUpdateCampaignStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: CampaignStatus) => {
      const response = await apiClient.put<Campaign>(`/api/business/campaigns/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// Delete campaign
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/business/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// Accept application (renamed from approve)
export function useAcceptApplication(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AcceptApplicationRequest) => {
      const response = await apiClient.post(
        `/api/business/campaigns/${campaignId}/applications/${data.applicationId}/accept`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.applications(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.participants(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.metrics(campaignId) });
    },
  });
}

// Reject application
export function useRejectApplication(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RejectApplicationRequest) => {
      const response = await apiClient.post(
        `/api/business/campaigns/${campaignId}/applications/${data.applicationId}/reject`,
        { reason: data.reason }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.applications(campaignId) });
    },
  });
}

// Remove participant
export function useRemoveParticipant(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RemoveParticipantRequest) => {
      const response = await apiClient.delete(
        `/api/business/campaigns/${campaignId}/participants/${data.participantId}`,
        { data: { reason: data.reason } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.participants(campaignId) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.metrics(campaignId) });
    },
  });
}

// Duplicate campaign
export function useDuplicateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Campaign>(`/api/business/campaigns/${id}/duplicate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
  });
}

// Fetch content submissions
export function useContentSubmissions(id: string) {
  return useQuery({
    queryKey: campaignKeys.contentSubmissions(id),
    queryFn: async () => {
      const response = await apiClient.get<ContentSubmission[]>(
        `/api/business/campaigns/${id}/content-submissions`
      );
      return response.data;
    },
    enabled: !!id,
  });
}

// Mark content as viewed
export function useMarkContentViewed(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiClient.patch(
        `/api/business/campaigns/${campaignId}/content-submissions/${contentId}/view`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.contentSubmissions(campaignId) });
    },
  });
}

// Approve content
export function useApproveContent(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentId: string) => {
      const response = await apiClient.patch(
        `/api/business/campaigns/${campaignId}/content-submissions/${contentId}/approve`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: campaignKeys.contentSubmissions(campaignId) });
    },
  });
}
