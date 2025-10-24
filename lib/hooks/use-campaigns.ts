import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '@/lib/api/campaigns';
import {
  CampaignFilters,
  CreateCampaignRequest,
  CampaignStatus,
} from '@/lib/types/campaign';

// Query keys
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters?: CampaignFilters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const,
};

// Get campaigns list with filters
export function useCampaigns(filters?: CampaignFilters) {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: () => campaignsApi.getCampaigns(filters),
    staleTime: 30000, // 30 seconds
  });
}

// Get single campaign
export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignsApi.getCampaign(id),
    enabled: !!id,
  });
}

// Create campaign mutation
export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignRequest) => campaignsApi.createCampaign(data),
    onSuccess: () => {
      // Invalidate all campaign lists
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Update campaign mutation
export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCampaignRequest> }) =>
      campaignsApi.updateCampaign(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific campaign and all lists
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Update campaign status mutation
export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CampaignStatus }) =>
      campaignsApi.updateCampaignStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: campaignKeys.detail(id) });

      // Snapshot the previous value
      const previousCampaign = queryClient.getQueryData(campaignKeys.detail(id));

      // Optimistically update the cache
      queryClient.setQueryData(campaignKeys.detail(id), (old: any) => {
        if (!old) return old;
        return { ...old, status };
      });

      return { previousCampaign };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousCampaign) {
        queryClient.setQueryData(campaignKeys.detail(id), context.previousCampaign);
      }
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Delete campaign mutation
export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      // Invalidate all campaign lists
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}

// Duplicate campaign mutation
export function useDuplicateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => campaignsApi.duplicateCampaign(id),
    onSuccess: () => {
      // Invalidate all campaign lists
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() });
    },
  });
}
