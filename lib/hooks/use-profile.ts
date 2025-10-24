import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/profile';
import {
  UpdateBusinessProfileRequest,
  InviteTeamMemberRequest,
  UpdateTeamMemberRequest,
  PrivacySettings,
  DisplaySettings,
  ChangePasswordRequest,
  RequestEmailChangeRequest,
  ChangeEmailRequest,
  AutoRechargeSettings,
  TaxInformation,
  BillingHistoryFilters,
} from '@/lib/types/profile';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  business: () => [...profileKeys.all, 'business'] as const,
  team: () => [...profileKeys.all, 'team'] as const,
  account: () => [...profileKeys.all, 'account'] as const,
  privacy: () => [...profileKeys.all, 'privacy'] as const,
  display: () => [...profileKeys.all, 'display'] as const,
  paymentMethods: () => [...profileKeys.all, 'payment-methods'] as const,
  billingHistory: (filters?: BillingHistoryFilters) => [...profileKeys.all, 'billing-history', filters] as const,
  autoRecharge: () => [...profileKeys.all, 'auto-recharge'] as const,
  taxInfo: () => [...profileKeys.all, 'tax-info'] as const,
};

// Business Profile Hooks
export function useBusinessProfile() {
  return useQuery({
    queryKey: profileKeys.business(),
    queryFn: () => profileApi.getBusinessProfile(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateBusinessProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBusinessProfileRequest) => profileApi.updateBusinessProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.business(), data);
    },
  });
}

export function useUploadLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadLogo(file),
    onSuccess: (data) => {
      // Update the business profile with the new logo URL
      queryClient.setQueryData(profileKeys.business(), (old: any) => {
        if (!old) return old;
        return { ...old, logoUrl: data.url };
      });
    },
  });
}

// Team Members Hooks
export function useTeamMembers() {
  return useQuery({
    queryKey: profileKeys.team(),
    queryFn: () => profileApi.getTeamMembers(),
    staleTime: 30000, // 30 seconds
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteTeamMemberRequest) => profileApi.inviteTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.team() });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, data }: { memberId: string; data: UpdateTeamMemberRequest }) =>
      profileApi.updateTeamMember(memberId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.team() });
    },
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => profileApi.removeTeamMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.team() });
    },
  });
}

export function useResendInvitation() {
  return useMutation({
    mutationFn: (memberId: string) => profileApi.resendInvitation(memberId),
  });
}

// Account Settings Hooks
export function useAccountSettings() {
  return useQuery({
    queryKey: profileKeys.account(),
    queryFn: () => profileApi.getAccountSettings(),
    staleTime: 60000, // 1 minute
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => profileApi.changePassword(data),
  });
}

export function useRequestEmailChange() {
  return useMutation({
    mutationFn: (data: RequestEmailChangeRequest) => profileApi.requestEmailChange(data),
  });
}

export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChangeEmailRequest) => profileApi.changeEmail(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.account() });
    },
  });
}

export function useEnableTwoFactor() {
  return useMutation({
    mutationFn: () => profileApi.enableTwoFactor(),
  });
}

export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => profileApi.verifyTwoFactor(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.account() });
    },
  });
}

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => profileApi.disableTwoFactor(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.account() });
    },
  });
}

// Privacy Settings Hooks
export function usePrivacySettings() {
  return useQuery({
    queryKey: profileKeys.privacy(),
    queryFn: () => profileApi.getPrivacySettings(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PrivacySettings) => profileApi.updatePrivacySettings(data),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.privacy() });
      const previousSettings = queryClient.getQueryData(profileKeys.privacy());
      queryClient.setQueryData(profileKeys.privacy(), newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(profileKeys.privacy(), context.previousSettings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.privacy() });
    },
  });
}

// Display Settings Hooks
export function useDisplaySettings() {
  return useQuery({
    queryKey: profileKeys.display(),
    queryFn: () => profileApi.getDisplaySettings(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateDisplaySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DisplaySettings) => profileApi.updateDisplaySettings(data),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.display() });
      const previousSettings = queryClient.getQueryData(profileKeys.display());
      queryClient.setQueryData(profileKeys.display(), newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(profileKeys.display(), context.previousSettings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.display() });
    },
  });
}

// Payment Methods Hooks
export function usePaymentMethods() {
  return useQuery({
    queryKey: profileKeys.paymentMethods(),
    queryFn: () => profileApi.getPaymentMethods(),
    staleTime: 30000, // 30 seconds
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) => profileApi.addPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.paymentMethods() });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) => profileApi.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.paymentMethods() });
    },
  });
}

export function useRemovePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethodId: string) => profileApi.removePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.paymentMethods() });
    },
  });
}

// Billing History Hooks
export function useBillingHistory(filters?: BillingHistoryFilters) {
  return useQuery({
    queryKey: profileKeys.billingHistory(filters),
    queryFn: () => profileApi.getBillingHistory(filters),
    staleTime: 30000, // 30 seconds
  });
}

export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (invoiceId: string) => profileApi.downloadInvoice(invoiceId),
    onSuccess: (blob, invoiceId) => {
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

export function useExportBillingHistory() {
  return useMutation({
    mutationFn: (filters?: BillingHistoryFilters) => profileApi.exportBillingHistory(filters),
    onSuccess: (blob) => {
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `billing-history-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

// Auto Recharge Hooks
export function useAutoRechargeSettings() {
  return useQuery({
    queryKey: profileKeys.autoRecharge(),
    queryFn: () => profileApi.getAutoRechargeSettings(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateAutoRechargeSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AutoRechargeSettings) => profileApi.updateAutoRechargeSettings(data),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.autoRecharge() });
      const previousSettings = queryClient.getQueryData(profileKeys.autoRecharge());
      queryClient.setQueryData(profileKeys.autoRecharge(), newSettings);
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(profileKeys.autoRecharge(), context.previousSettings);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.autoRecharge() });
    },
  });
}

// Tax Information Hooks
export function useTaxInformation() {
  return useQuery({
    queryKey: profileKeys.taxInfo(),
    queryFn: () => profileApi.getTaxInformation(),
    staleTime: 60000, // 1 minute
  });
}

export function useUpdateTaxInformation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaxInformation) => profileApi.updateTaxInformation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.taxInfo() });
    },
  });
}

export function useUploadTaxDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadTaxDocument(file),
    onSuccess: (data) => {
      // Update the tax information with the new document URL
      queryClient.setQueryData(profileKeys.taxInfo(), (old: any) => {
        if (!old) return old;
        return { ...old, taxExemptDocumentUrl: data.url };
      });
    },
  });
}
