'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useForgotPassword } from '@/lib/hooks/use-forgot-password';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>();

  const { mutate: sendResetEmail, isPending, error } = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    sendResetEmail(data, {
      onSuccess: () => {
        setIsSuccess(true);
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Check Your Email
          </h1>
          <p className="text-gray-600">
            We&apos;ve sent password reset instructions to
          </p>
          <p className="mt-1 font-medium text-gray-900">{getValues('email')}</p>
        </div>

        <div className="space-y-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <p className="font-medium">What&apos;s next?</p>
          <ol className="ml-4 list-decimal space-y-2">
            <li>Check your email inbox (and spam folder)</li>
            <li>Click the password reset link in the email</li>
            <li>Create a new password for your account</li>
          </ol>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => setIsSuccess(false)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
          >
            Didn&apos;t receive the email? Try again
          </button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm font-medium text-pink-500 hover:text-pink-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Forgot Password?
        </h1>
        <p className="text-gray-600">
          No worries, we&apos;ll send you reset instructions
        </p>
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
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email Address
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
              placeholder="you@example.com"
              disabled={isPending}
              autoFocus
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
              Sending...
            </span>
          ) : (
            'Send Reset Instructions'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
