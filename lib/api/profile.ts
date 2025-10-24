import { apiClient } from './client';
import axios from 'axios';
import {
  BusinessProfile,
  UpdateBusinessProfileRequest,
  TeamMember,
  InviteTeamMemberRequest,
  UpdateTeamMemberRequest,
  PrivacySettings,
  DisplaySettings,
  AccountSettings,
  ChangePasswordRequest,
  RequestEmailChangeRequest,
  ChangeEmailRequest,
  PaymentMethod,
  BillingHistoryItem,
  BillingHistoryFilters,
  BillingHistoryResponse,
  AutoRechargeSettings,
  TaxInformation,
} from '@/lib/types/profile';

// Helper function to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Local client for Next.js API routes (no baseURL, uses relative paths)
const nextApiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to Next.js API requests
nextApiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getCookie('auth_token') || localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Backend response type (snake_case from Supabase)
interface BackendBusinessProfile {
  id: string;
  userId: string;
  business_name: string;
  address?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  phoneNumber?: string;
  email: string;
  availableCredits: number;
  website?: string | null;
  imageUrls?: string[];
  logoUrl?: string;
  isVerified: boolean;
  socialMediaHandles?: {
    instagram?: string | null;
    facebook?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
  } | null;
  needsOnboarding?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Transform backend response to frontend format
function transformBusinessProfile(data: BackendBusinessProfile): BusinessProfile {
  return {
    id: data.id,
    businessName: data.business_name || '',
    logoUrl: data.logoUrl || data.imageUrls?.[0],
    phone: data.phone || data.phoneNumber || '',
    email: data.email,
    website: data.website || undefined,
    address: {
      street: data.streetAddress || data.address || '',
      city: data.city || '',
      state: data.state || '',
      zipCode: data.postalCode || '',
      country: data.country || '',
    },
    socialMedia: {
      instagram: data.socialMediaHandles?.instagram || undefined,
      tiktok: data.socialMediaHandles?.tiktok || undefined,
      youtube: data.socialMediaHandles?.youtube || undefined,
      facebook: data.socialMediaHandles?.facebook || undefined,
      twitter: data.socialMediaHandles?.twitter || undefined,
      linkedin: data.socialMediaHandles?.linkedin || undefined,
    },
    credits: data.availableCredits || 0,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export const profileApi = {
  // Business Profile
  getBusinessProfile: async (): Promise<BusinessProfile> => {
    const response = await apiClient.get<BackendBusinessProfile>('/api/business/profile');
    return transformBusinessProfile(response.data);
  },

  updateBusinessProfile: async (data: UpdateBusinessProfileRequest): Promise<BusinessProfile> => {
    // Transform the data to match backend expectations
    const backendData: any = {
      business_name: data.businessName,
      phone: data.phone,
      email: data.email,
      website: data.website || null,
      street_address: data.address?.street,
      city: data.address?.city,
      state: data.address?.state,
      postal_code: data.address?.zipCode,
      country: data.address?.country,
      instagram_handle: data.socialMedia?.instagram,
      tiktok_handle: data.socialMedia?.tiktok,
      youtube_channel: data.socialMedia?.youtube,
      facebook_page: data.socialMedia?.facebook,
      twitter_handle: data.socialMedia?.twitter,
      linkedin_company: data.socialMedia?.linkedin,
    };

    const response = await apiClient.put<BackendBusinessProfile>('/api/business/profile', backendData);
    return transformBusinessProfile(response.data);
  },

  uploadLogo: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await apiClient.post('/api/business/profile/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Team Members (using Next.js API routes)
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await nextApiClient.get<TeamMember[]>('/api/profile/team');
    return response.data;
  },

  inviteTeamMember: async (data: InviteTeamMemberRequest): Promise<TeamMember> => {
    const response = await nextApiClient.post<TeamMember>('/api/profile/team/invite', data);
    return response.data;
  },

  updateTeamMember: async (memberId: string, data: UpdateTeamMemberRequest): Promise<TeamMember> => {
    const response = await nextApiClient.patch<TeamMember>(`/api/profile/team/${memberId}`, data);
    return response.data;
  },

  removeTeamMember: async (memberId: string): Promise<void> => {
    await nextApiClient.delete(`/api/profile/team/${memberId}`);
  },

  resendInvitation: async (memberId: string): Promise<void> => {
    await nextApiClient.post(`/api/profile/team/${memberId}/resend-invitation`);
  },

  // Account Settings (using Next.js API routes)
  getAccountSettings: async (): Promise<AccountSettings> => {
    const response = await nextApiClient.get<AccountSettings>('/api/profile/account');
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await nextApiClient.post('/api/profile/account/change-password', data);
  },

  requestEmailChange: async (data: RequestEmailChangeRequest): Promise<void> => {
    await nextApiClient.post('/api/profile/account/request-email-change', data);
  },

  changeEmail: async (data: ChangeEmailRequest): Promise<void> => {
    await nextApiClient.post('/api/profile/account/change-email', data);
  },

  enableTwoFactor: async (): Promise<{ qrCode: string; secret: string }> => {
    const response = await nextApiClient.post('/api/profile/account/enable-2fa');
    return response.data;
  },

  verifyTwoFactor: async (code: string): Promise<void> => {
    await nextApiClient.post('/api/profile/account/verify-2fa', { code });
  },

  disableTwoFactor: async (password: string): Promise<void> => {
    await nextApiClient.post('/api/profile/account/disable-2fa', { password });
  },

  // Privacy Settings (using Next.js API routes)
  getPrivacySettings: async (): Promise<PrivacySettings> => {
    const response = await nextApiClient.get<PrivacySettings>('/api/profile/privacy');
    return response.data;
  },

  updatePrivacySettings: async (data: PrivacySettings): Promise<PrivacySettings> => {
    const response = await nextApiClient.patch<PrivacySettings>('/api/profile/privacy', data);
    return response.data;
  },

  // Display Settings (using Next.js API routes)
  getDisplaySettings: async (): Promise<DisplaySettings> => {
    const response = await nextApiClient.get<DisplaySettings>('/api/profile/display');
    return response.data;
  },

  updateDisplaySettings: async (data: DisplaySettings): Promise<DisplaySettings> => {
    const response = await nextApiClient.patch<DisplaySettings>('/api/profile/display', data);
    return response.data;
  },

  // Payment Methods (using Next.js API routes)
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await nextApiClient.get<PaymentMethod[]>('/api/profile/billing/payment-methods');
    return response.data;
  },

  addPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await nextApiClient.post<PaymentMethod>('/api/profile/billing/payment-methods', {
      paymentMethodId,
    });
    return response.data;
  },

  setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await nextApiClient.patch(`/api/profile/billing/payment-methods/${paymentMethodId}/default`);
  },

  removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
    await nextApiClient.delete(`/api/profile/billing/payment-methods/${paymentMethodId}`);
  },

  // Billing History (using Next.js API routes)
  getBillingHistory: async (filters?: BillingHistoryFilters): Promise<BillingHistoryResponse> => {
    const params = new URLSearchParams();

    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.page) {
      params.append('page', filters.page.toString());
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `/api/profile/billing/history${queryString ? `?${queryString}` : ''}`;

    const response = await nextApiClient.get<BillingHistoryResponse>(url);
    return response.data;
  },

  downloadInvoice: async (invoiceId: string): Promise<Blob> => {
    const response = await nextApiClient.get(`/api/profile/billing/invoices/${invoiceId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportBillingHistory: async (filters?: BillingHistoryFilters): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const queryString = params.toString();
    const url = `/api/profile/billing/export${queryString ? `?${queryString}` : ''}`;

    const response = await nextApiClient.get(url, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Auto Recharge (using Next.js API routes)
  getAutoRechargeSettings: async (): Promise<AutoRechargeSettings> => {
    const response = await nextApiClient.get<AutoRechargeSettings>('/api/profile/billing/auto-recharge');
    return response.data;
  },

  updateAutoRechargeSettings: async (data: AutoRechargeSettings): Promise<AutoRechargeSettings> => {
    const response = await nextApiClient.patch<AutoRechargeSettings>('/api/profile/billing/auto-recharge', data);
    return response.data;
  },

  // Tax Information (using Next.js API routes)
  getTaxInformation: async (): Promise<TaxInformation> => {
    const response = await nextApiClient.get<TaxInformation>('/api/profile/billing/tax');
    return response.data;
  },

  updateTaxInformation: async (data: TaxInformation): Promise<TaxInformation> => {
    const response = await nextApiClient.patch<TaxInformation>('/api/profile/billing/tax', data);
    return response.data;
  },

  uploadTaxDocument: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('document', file);

    const response = await nextApiClient.post('/api/profile/billing/tax/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
