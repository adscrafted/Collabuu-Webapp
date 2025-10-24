// Campaign Types and Interfaces
import React from 'react';
import { Users, Camera, Gift } from 'lucide-react';

export enum CampaignType {
  PAY_PER_CUSTOMER = 'pay_per_customer',
  MEDIA_EVENT = 'media_event',
  REWARDS = 'rewards',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CampaignRequirements {
  minFollowerCount?: number;
  requiredHashtags?: string[];
  locationRequirements?: string;
  ageRestrictions?: {
    min?: number;
    max?: number;
  };
}

export interface CampaignBudget {
  // For Pay Per Customer
  creditsPerCustomer?: number;
  creditsPerAction?: number;
  maxVisits?: number;
  influencerSpots?: number;

  // For Media Event
  // influencerSpots is also used here (max spots)
  influencerSpotsFilled?: number; // Current filled spots

  // For Rewards
  rewardValue?: number;

  // Common
  totalCredits: number;
}

export interface CampaignFormData {
  // Step 1: Campaign Type
  type: CampaignType;

  // Step 2: Basic Information
  title: string;
  description: string;
  imageUrl?: string;
  imageFile?: File;

  // Step 3: Campaign Details
  startDate: Date;
  endDate: Date;
  budget: CampaignBudget;
  requirements: string; // Changed from CampaignRequirements object to required string
  visibility: 'public' | 'private';
  eventDate?: Date; // Optional, for media_event type
}

export interface Campaign {
  id: string;
  businessId: string;
  type: CampaignType;
  status: CampaignStatus;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  periodStart?: string; // iOS field name alias for startDate
  periodEnd?: string; // iOS field name alias for endDate
  eventDate?: string;
  budget: CampaignBudget;
  requirements: string; // Changed to required string
  visibility: 'public' | 'private'; // Changed to required
  shareLink?: string;
  influencerCount?: number; // Number of accepted influencers (for delete validation)
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignRequest {
  type: CampaignType;
  title: string;
  description: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  eventDate?: string;
  budget: CampaignBudget;
  requirements: string; // Changed to required
  visibility: 'public' | 'private'; // Changed to required
  status: CampaignStatus;
}

export interface CampaignTypeOption {
  type: CampaignType;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  exampleUseCase: string;
  pricingModel: string;
  fixedCredits?: number;
}

export const CAMPAIGN_TYPE_OPTIONS: CampaignTypeOption[] = [
  {
    type: CampaignType.PAY_PER_CUSTOMER,
    icon: Users,
    title: 'Pay Per Customer',
    description: 'Pay for each customer visit',
    exampleUseCase: 'Perfect for restaurants, cafes, and retail stores looking to drive foot traffic',
    pricingModel: 'Variable - Set credits per visit',
  },
  {
    type: CampaignType.MEDIA_EVENT,
    icon: Camera,
    title: 'Media Event',
    description: 'Fixed price for event coverage',
    exampleUseCase: 'Ideal for product launches, grand openings, or special events',
    pricingModel: 'Fixed - 300 credits',
    fixedCredits: 300,
  },
  {
    type: CampaignType.REWARDS,
    icon: Gift,
    title: 'Rewards',
    description: 'Reward repeat customers',
    exampleUseCase: 'Great for building customer loyalty and encouraging repeat visits',
    pricingModel: 'Variable - Set reward value and limits',
  },
];

// Campaign Stats (for list view)
export interface CampaignStats {
  participantsCount: number;
  visitsCount: number;
  creditsSpent: number;
}

// Extended Campaign with Stats
export interface CampaignWithStats extends Campaign {
  stats: CampaignStats;
}

// Campaign Filters
export interface CampaignFilters {
  status?: CampaignStatus[];
  type?: CampaignType;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'newest' | 'oldest' | 'most_visits' | 'end_date';
  page?: number;
  limit?: number;
}

// Campaign List Response
export interface CampaignListResponse {
  campaigns: CampaignWithStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Campaign Detail Types
export interface CampaignMetrics {
  totalVisits: number;
  influencerVisitorCount: number; // Visitors attributed to influencer referrals
  directAppVisitorCount: number; // Visitors from direct app (platform attribution)
  totalParticipants: number;
  creditsSpent: number;
  totalBudget: number;
  conversionRate: number;
  averageCostPerVisit: number;
  totalViews: number;
  clickThroughRate: number;
  averageSessionDuration: number;
}

export interface Visit {
  id: string;
  campaignId: string;
  customerId: string;
  customerName: string;
  influencerId?: string;
  influencerName?: string;
  source: 'influencer' | 'direct';
  credits: number;
  visitDate: string;
  createdAt: string;
}

export interface InfluencerApplication {
  id: string;
  campaignId: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  followerCount: number;
  engagementRate: number;
  applicationMessage: string;
  portfolioImages?: string[];
  socialMediaLinks: {
    platform: string;
    url: string;
    followers: number;
  }[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  appliedAt: string;
  reviewedAt?: string;
}

export interface CampaignParticipant {
  id: string;
  campaignId: string;
  userId: string; // iOS field name (replaces influencerId)
  influencerName: string;
  influencerAvatar?: string;
  followerCount: number;
  joinedAt: string;
  visitsGenerated: number;
  conversions: number;
  creditsEarned: number;
  conversionRate: number;
  lastActivityAt?: string;
  visitCount?: number;         // Number of visits generated by this influencer
  customerCount?: number;      // Number of unique customers brought by this influencer
}

export interface CampaignActivity {
  id: string;
  campaignId: string;
  type: 'created' | 'application_received' | 'influencer_accepted' | 'visit_logged' | 'status_changed';
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  imageUrl?: string;
  startDate?: string;
  endDate?: string;
  period_start?: string; // iOS compatibility - snake_case format
  period_end?: string;   // iOS compatibility - snake_case format
  eventDate?: string;
  budget?: CampaignBudget;
  requirements?: string; // Changed from CampaignRequirements to string
  visibility?: 'public' | 'private';
  status?: CampaignStatus;
}

export interface AcceptApplicationRequest {
  applicationId: string;
}

export interface RejectApplicationRequest {
  applicationId: string;
  reason?: string;
}

export interface RemoveParticipantRequest {
  participantId: string;
  reason?: string;
}

export type DateRangePreset = 'last_7_days' | 'last_30_days' | 'all_time' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

// Content Submission Types
export interface ContentSubmission {
  id: string;
  campaignId: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  influencerUsername?: string;
  postType: 'video' | 'image' | 'post';
  platform: 'instagram' | 'youtube' | 'tiktok' | 'other';
  contentUrl: string;
  imageUrl?: string;
  caption?: string;
  status: 'new' | 'viewed' | 'approved';
  postedAt: string;
  viewedAt?: string;
}
