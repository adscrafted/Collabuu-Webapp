import { z } from 'zod';
import { CampaignType } from '@/lib/types/campaign';

// Step 1: Campaign Type Schema
export const campaignTypeSchema = z.object({
  type: z.nativeEnum(CampaignType),
});

// Step 2: Basic Information Schema
export const basicInfoSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be less than 100 characters'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters')
      .max(1000, 'Description must be less than 1000 characters'),
    imageUrl: z.string().url().optional(),
    imageFile: z.instanceof(File).optional(),
  })
  .refine((data) => data.imageUrl || data.imageFile, {
    message: 'Either image URL or image file must be provided',
    path: ['imageUrl'],
  });

// Requirements field (replaces structured requirements object)
const requirementsSchema = z
  .string()
  .min(10, 'Requirements must be at least 10 characters')
  .max(2000, 'Requirements must be less than 2000 characters');

// Visibility enum - with default value but non-optional type
export const visibilitySchema = z.enum(['public', 'private']);

// Budget Schema (conditional based on campaign type)
const budgetSchema = z.object({
  creditsPerCustomer: z.number().min(1).max(1000).optional(),
  creditsPerAction: z.number().optional(),
  maxVisits: z.number().min(1).optional(),
  influencerSpots: z.number().min(1).max(1000).optional(),
  rewardValue: z.number().min(1).optional(),
  totalCredits: z.number().min(1).max(1000000), // iOS max is 1,000,000
});

// Step 3: Campaign Details Schema
export const campaignDetailsSchema = z
  .object({
    startDate: z.date({
      message: 'Start date is required',
    }),
    endDate: z.date({
      message: 'End date is required',
    }),
    budget: budgetSchema,
    requirements: requirementsSchema,
    visibility: visibilitySchema,
    eventDate: z.date().optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => data.startDate >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Start date cannot be in the past',
    path: ['startDate'],
  })
  .refine(
    (data) => {
      // Calculate duration in days
      const durationMs = data.endDate.getTime() - data.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      return durationDays <= 365;
    },
    {
      message: 'Campaign cannot be longer than 365 days',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // Calculate duration in days
      const durationMs = data.endDate.getTime() - data.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      return durationDays >= 1;
    },
    {
      message: 'Campaign must be at least 1 day long',
      path: ['endDate'],
    }
  );

// Step 4: Review Schema (no fields needed, iOS doesn't have terms/publish options)
export const reviewSchema = z.object({});

// Combined Schema for Final Submission
export const campaignFormSchema = z
  .object({
    type: z.nativeEnum(CampaignType),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be less than 1000 characters'),
    imageUrl: z.string().url().optional(),
    imageFile: z.instanceof(File).optional(),
    startDate: z.date(),
    endDate: z.date(),
    budget: budgetSchema,
    requirements: z.string().min(10).max(2000),
    visibility: visibilitySchema,
    eventDate: z.date().optional(),
  })
  .refine((data) => data.imageUrl || data.imageFile, {
    message: 'Either image URL or image file must be provided',
    path: ['imageUrl'],
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => data.startDate >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: 'Start date cannot be in the past',
    path: ['startDate'],
  })
  .refine(
    (data) => {
      // Calculate duration in days
      const durationMs = data.endDate.getTime() - data.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      return durationDays <= 365;
    },
    {
      message: 'Campaign cannot be longer than 365 days',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // Calculate duration in days
      const durationMs = data.endDate.getTime() - data.startDate.getTime();
      const durationDays = durationMs / (1000 * 60 * 60 * 24);
      return durationDays >= 1;
    },
    {
      message: 'Campaign must be at least 1 day long',
      path: ['endDate'],
    }
  )
  .refine(
    (data) => {
      // Pay Per Customer must have creditsPerCustomer and influencerSpots
      if (data.type === CampaignType.PAY_PER_CUSTOMER) {
        return (
          data.budget.creditsPerCustomer !== undefined &&
          data.budget.influencerSpots !== undefined &&
          data.budget.creditsPerCustomer >= 1 &&
          data.budget.creditsPerCustomer <= 1000 &&
          data.budget.influencerSpots >= 1 &&
          data.budget.influencerSpots <= 1000
        );
      }
      return true;
    },
    {
      message: 'Pay Per Customer campaigns require credits per customer (1-1000) and influencer spots (1-1000)',
      path: ['budget'],
    }
  )
  .refine(
    (data) => {
      // Pay Per Customer: totalCredits must be >= (influencerSpots × 150)
      if (data.type === CampaignType.PAY_PER_CUSTOMER) {
        const minCredits = (data.budget.influencerSpots || 0) * 150;
        return data.budget.totalCredits >= minCredits;
      }
      return true;
    },
    {
      message: 'Total credits must be at least influencer spots × 150',
      path: ['budget', 'totalCredits'],
    }
  )
  .refine(
    (data) => {
      // Media Event must have totalCredits = 300
      if (data.type === CampaignType.MEDIA_EVENT) {
        return data.budget.totalCredits === 300;
      }
      return true;
    },
    {
      message: 'Media Event campaigns must have exactly 300 total credits',
      path: ['budget', 'totalCredits'],
    }
  )
  .refine(
    (data) => {
      // Rewards must have totalCredits = 0, influencerSpots = 0, visibility = 'public'
      if (data.type === CampaignType.REWARDS) {
        return (
          data.budget.totalCredits === 0 &&
          (data.budget.influencerSpots === 0 || data.budget.influencerSpots === undefined) &&
          data.visibility === 'public'
        );
      }
      return true;
    },
    {
      message: 'Rewards campaigns must have 0 total credits, 0 influencer spots, and public visibility',
      path: ['budget'],
    }
  )
  .refine(
    (data) => {
      // Rewards must have rewardValue
      if (data.type === CampaignType.REWARDS) {
        return (
          data.budget.rewardValue !== undefined &&
          data.budget.rewardValue > 0
        );
      }
      return true;
    },
    {
      message: 'Rewards campaigns require reward value',
      path: ['budget'],
    }
  )
  .refine(
    (data) => {
      // Media Event must have eventDate
      if (data.type === CampaignType.MEDIA_EVENT) {
        return data.eventDate !== undefined && data.eventDate !== null;
      }
      return true;
    },
    {
      message: 'Event date is required for media events',
      path: ['eventDate'],
    }
  )
  .refine(
    (data) => {
      // Event date must be in the future
      if (data.type === CampaignType.MEDIA_EVENT && data.eventDate) {
        const now = new Date();
        return data.eventDate > now;
      }
      return true;
    },
    {
      message: 'Event must be scheduled in the future',
      path: ['eventDate'],
    }
  )
  .refine(
    (data) => {
      // Event date cannot be more than 1 year in the future
      if (data.type === CampaignType.MEDIA_EVENT && data.eventDate) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return data.eventDate <= oneYearFromNow;
      }
      return true;
    },
    {
      message: 'Event cannot be more than 1 year in the future',
      path: ['eventDate'],
    }
  )
  .refine(
    (data) => {
      // Media Event influencer spots max 50
      if (data.type === CampaignType.MEDIA_EVENT) {
        return (
          data.budget.influencerSpots !== undefined &&
          data.budget.influencerSpots >= 1 &&
          data.budget.influencerSpots <= 50
        );
      }
      return true;
    },
    {
      message: 'Media Event campaigns require influencer spots between 1 and 50',
      path: ['budget', 'influencerSpots'],
    }
  );

export type CampaignFormData = z.infer<typeof campaignFormSchema>;
export type CampaignTypeFormData = z.infer<typeof campaignTypeSchema>;
export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type CampaignDetailsFormData = z.infer<typeof campaignDetailsSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
