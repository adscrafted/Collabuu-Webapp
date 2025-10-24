'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { Lock, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useResetPassword } from '@/lib/hooks/use-reset-password';
import { createClient } from '@/lib/supabase/client';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const { mutate: resetPassword, isPending, error } = useResetPassword();

  // Check if the user has a valid password reset session
  useEffect(() => {
    const checkSession = async () => {
      if (typeof window === 'undefined') return;

      const supabase = createClient();
      const { data } = await supabase!.auth.getSession();

      // Check if there's a session (user clicked the reset link)
      setIsValidSession(!!data.session);
    };

    checkSession();
  }, []);

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword(
      { password: data.password },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  // Loading state while checking session
  if (isValidSession === null) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          <p className="mt-4 text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Invalid or Expired Link
          </h1>
          <p className="text-gray-600">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/forgot-password"
            className="block w-full rounded-lg bg-pink-500 py-3 text-center font-semibold text-white transition-all hover:bg-pink-600 hover:shadow-lg"
          >
            Request New Reset Link
          </Link>

          <Link
            href="/login"
            className="block w-full rounded-lg border border-gray-300 bg-white py-3 text-center font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Password Reset Successful
          </h1>
          <p className="text-gray-600">
            Your password has been reset successfully.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Redirecting you to login...
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full rounded-lg bg-pink-500 py-3 text-center font-semibold text-white transition-all hover:bg-pink-600 hover:shadow-lg"
        >
          Continue to Login
        </Link>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Reset Password
        </h1>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
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
              } py-3 pl-10 pr-12 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'focus:ring-red-500/20'
                  : 'focus:ring-pink-500/20'
              }`}
              placeholder="••••••••"
              disabled={isPending}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === watch('password') || "Passwords don't match",
              })}
              className={`w-full rounded-lg border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-12 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'focus:ring-red-500/20'
                  : 'focus:ring-pink-500/20'
              }`}
              placeholder="••••••••"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
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
              Resetting Password...
            </span>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
