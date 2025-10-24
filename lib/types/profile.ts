// Profile Types and Interfaces

export interface BusinessProfile {
  id: string;
  businessName: string;
  logoUrl?: string;
  phone: string;
  email: string;
  website?: string;
  address: Address;
  socialMedia: SocialMedia;
  credits: number;
  createdAt: string;
  updatedAt: string;
  // Deprecated fields (kept for backward compatibility)
  businessType?: string;
  description?: string;
  businessHours?: BusinessHours;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface SocialMedia {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: TeamMemberRole;
  permissions: TeamPermission[];
  status: TeamMemberStatus;
  invitedAt?: string;
  joinedAt?: string;
  invitedBy?: string;
}

export type TeamMemberRole = 'owner' | 'admin' | 'editor';
export type TeamMemberStatus = 'active' | 'pending';

export const TEAM_PERMISSIONS = [
  'manage_campaigns',
  'approve_influencers',
  'manage_billing',
  'manage_team',
] as const;

export type TeamPermission = typeof TEAM_PERMISSIONS[number];

export interface InviteTeamMemberRequest {
  email: string;
  role: TeamMemberRole;
}

export interface UpdateTeamMemberRequest {
  role?: TeamMemberRole;
}

export interface RemoveTeamMemberRequest {
  memberId: string;
  reason?: string;
}

export interface PrivacySettings {
  profileVisibility: ProfileVisibility;
  dataSharing: boolean;
  cookiePreferences: CookiePreferences;
}

export type ProfileVisibility = 'public' | 'private' | 'business_partners';

export interface CookiePreferences {
  necessary: true; // Always true (cannot be disabled)
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface DisplaySettings {
  language: string;
  timezone: string;
  dateFormat: DateFormat;
  currency: string;
}

export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

export interface AccountSettings {
  email: string;
  hasPassword: boolean;
  twoFactorEnabled: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  verificationCode: string;
}

export interface RequestEmailChangeRequest {
  newEmail: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: BillingStatus;
  invoiceUrl?: string;
}

export type BillingStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface AutoRechargeSettings {
  enabled: boolean;
  threshold: number;
  packageId: string;
  packageCredits: number;
  packageAmount: number;
}

export interface TaxInformation {
  businessTaxId?: string;
  taxExempt: boolean;
  taxExemptDocumentUrl?: string;
}

export interface UpdateBusinessProfileRequest {
  businessName?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: Partial<Address>;
  socialMedia?: Partial<SocialMedia>;
  // Deprecated fields (kept for backward compatibility)
  businessType?: string;
  description?: string;
  businessHours?: Partial<BusinessHours>;
}

export interface BillingHistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: BillingStatus;
  page?: number;
  limit?: number;
}

export interface BillingHistoryResponse {
  items: BillingHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Business Type Options
export const BUSINESS_TYPES = [
  'Restaurant',
  'Cafe',
  'Bar',
  'Retail Store',
  'Boutique',
  'Salon',
  'Spa',
  'Gym',
  'Hotel',
  'Event Venue',
  'Service Provider',
  'Other',
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number];

// Country Options (common ones)
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
] as const;

// Language Options
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
] as const;

// Timezone Options (common ones)
export const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

// Currency Options
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
] as const;

// Default Business Hours
export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  friday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
  saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
  sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
};

// Role Display Names
export const ROLE_DISPLAY_NAMES: Record<TeamMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
};

// Permission Display Names
export const PERMISSION_DISPLAY_NAMES: Record<TeamPermission, string> = {
  manage_campaigns: 'Manage Campaigns',
  approve_influencers: 'Approve Influencers',
  manage_billing: 'Manage Billing',
  manage_team: 'Manage Team',
};

// Permission Descriptions
export const PERMISSION_DESCRIPTIONS: Record<TeamPermission, string> = {
  manage_campaigns: 'Create, edit, and delete campaigns',
  approve_influencers: 'Approve or reject influencer applications',
  manage_billing: 'Add payment methods and view billing history',
  manage_team: 'Invite, edit, and remove team members',
};
