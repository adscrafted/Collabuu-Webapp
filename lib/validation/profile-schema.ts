import { z } from 'zod';
import { TEAM_PERMISSIONS } from '../types/profile';

// Business Profile Schema
export const businessProfileSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name must be less than 100 characters'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State/Province is required'),
    zipCode: z.string().min(1, 'ZIP/Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
});

export type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

// Social Media Schema
const instagramHandleSchema = z.string().regex(/^@?[a-zA-Z0-9._]{1,30}$/, 'Invalid Instagram handle').optional().or(z.literal(''));
const twitterHandleSchema = z.string().regex(/^@?[a-zA-Z0-9_]{1,15}$/, 'Invalid Twitter handle').optional().or(z.literal(''));
const tiktokHandleSchema = z.string().regex(/^@?[a-zA-Z0-9._]{1,24}$/, 'Invalid TikTok handle').optional().or(z.literal(''));
const youtubeHandleSchema = z.string().regex(/^@?[a-zA-Z0-9._]{1,30}$/, 'Invalid YouTube handle').optional().or(z.literal(''));
const facebookHandleSchema = z.string().regex(/^@?[a-zA-Z0-9._]{1,50}$/, 'Invalid Facebook handle').optional().or(z.literal(''));
const linkedinHandleSchema = z.string().regex(/^@?[a-zA-Z0-9._\-]{1,100}$/, 'Invalid LinkedIn handle').optional().or(z.literal(''));

export const socialMediaSchema = z.object({
  instagram: instagramHandleSchema,
  tiktok: tiktokHandleSchema,
  youtube: youtubeHandleSchema,
  facebook: facebookHandleSchema,
  twitter: twitterHandleSchema,
  linkedin: linkedinHandleSchema,
});

export type SocialMediaFormData = z.infer<typeof socialMediaSchema>;

// Team Member Invitation Schema
export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'editor'], { message: 'Please select a role' }),
});

export type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;

// Password Change Schema
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
).refine(
  (data) => data.currentPassword !== data.newPassword,
  { message: 'New password must be different from current password', path: ['newPassword'] }
);

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// Email Change Schema
export const requestEmailChangeSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
});

export type RequestEmailChangeFormData = z.infer<typeof requestEmailChangeSchema>;

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  verificationCode: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Verification code must contain only numbers'),
});

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

// Privacy Settings Schema
export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'business_partners'], {
    message: 'Please select profile visibility',
  }),
  dataSharing: z.boolean(),
  cookiePreferences: z.object({
    necessary: z.literal(true),
    analytics: z.boolean(),
    marketing: z.boolean(),
    functional: z.boolean(),
  }),
});

export type PrivacySettingsFormData = z.infer<typeof privacySettingsSchema>;

// Display Settings Schema
export const displaySettingsSchema = z.object({
  language: z.string().min(1, 'Please select a language'),
  timezone: z.string().min(1, 'Please select a timezone'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'], {
    message: 'Please select a date format',
  }),
  currency: z.string().min(1, 'Please select a currency'),
});

export type DisplaySettingsFormData = z.infer<typeof displaySettingsSchema>;

// Password Strength Calculator
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};
