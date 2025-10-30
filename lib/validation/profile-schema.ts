import { z } from 'zod';

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

// Password Change Schema
export const passwordSchema = z.string()
  .min(6, 'Password must be at least 6 characters');

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
  // Check minimum requirements
  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const requirementsMet = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;

  if (requirementsMet < 3) return 'weak';
  if (requirementsMet === 3 || (requirementsMet >= 4 && password.length < 10)) return 'medium';
  return 'strong';
};
