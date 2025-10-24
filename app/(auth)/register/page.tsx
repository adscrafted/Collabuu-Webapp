'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Building2,
  Phone,
  Briefcase,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRegister } from '@/lib/hooks/use-register';

const registerSchema = z
  .object({
    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
    phone: z
      .string()
      .min(10, 'Please enter a valid phone number')
      .regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
    businessType: z.string().min(1, 'Please select a business type'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const businessTypes = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'retail', label: 'Retail Store' },
  { value: 'salon', label: 'Salon/Spa' },
  { value: 'fitness', label: 'Fitness Center' },
  { value: 'hotel', label: 'Hotel/Hospitality' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const { mutate: registerUser, isPending, error } = useRegister();

  const onSubmit = (data: RegisterFormData) => {
    registerUser(data);
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Create Business Account
        </h1>
        <p className="text-gray-600">Join Collabuu and start collaborating</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-medium">{error.message}</p>
            {error.errors && (
              <ul className="mt-2 list-inside list-disc space-y-1">
                {Object.entries(error.errors).map(([field, messages]) => (
                  <li key={field}>
                    {field}: {messages.join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label
            htmlFor="businessName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Business Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              id="businessName"
              autoComplete="organization"
              {...register('businessName', {
                required: 'Business name is required',
                minLength: {
                  value: 2,
                  message: 'Business name must be at least 2 characters',
                },
              })}
              className={`w-full rounded-lg border ${
                errors.businessName ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.businessName
                  ? 'focus:ring-red-500/20'
                  : 'focus:ring-pink-500/20'
              }`}
              placeholder="Your Business Name"
              disabled={isPending}
            />
          </div>
          {errors.businessName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.businessName.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              id="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
              className={`w-full rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.email ? 'focus:ring-red-500/20' : 'focus:ring-pink-500/20'
              }`}
              placeholder="you@business.com"
              disabled={isPending}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              id="phone"
              autoComplete="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^\+?[1-9]\d{1,14}$/,
                  message: 'Please enter a valid phone number',
                },
              })}
              className={`w-full rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.phone ? 'focus:ring-red-500/20' : 'focus:ring-pink-500/20'
              }`}
              placeholder="+1 (555) 123-4567"
              disabled={isPending}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="businessType"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Business Type
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              id="businessType"
              {...register('businessType', {
                required: 'Please select a business type',
              })}
              className={`w-full rounded-lg border ${
                errors.businessType ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.businessType
                  ? 'focus:ring-red-500/20'
                  : 'focus:ring-pink-500/20'
              }`}
              disabled={isPending}
            >
              <option value="">Select business type...</option>
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {errors.businessType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.businessType.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              id="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message:
                    'Password must contain uppercase, lowercase, and number',
                },
              })}
              className={`w-full rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'focus:ring-red-500/20'
                  : 'focus:ring-pink-500/20'
              }`}
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === watch('password') || "Passwords don't match",
              })}
              className={`w-full rounded-lg border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'focus:ring-red-500/20'
                  : 'focus:ring-pink-500/20'
              }`}
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="flex items-start">
            <input
              type="checkbox"
              {...register('acceptTerms', {
                required: 'You must accept the terms and conditions',
              })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              disabled={isPending}
            />
            <span className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <Link
                href="/terms"
                className="font-medium text-pink-500 hover:text-pink-600"
                target="_blank"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                className="font-medium text-pink-500 hover:text-pink-600"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="mt-1 text-sm text-red-600">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-pink-500 py-3 font-semibold text-white transition-all hover:bg-pink-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Account...
            </span>
          ) : (
            'Create Business Account'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-pink-500 hover:text-pink-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
