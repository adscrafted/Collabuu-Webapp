/**
 * Admin Login Page
 *
 * SECURITY FEATURES:
 * - Separate admin authentication flow
 * - Visual distinction from regular user login
 * - Account lockout warnings
 * - Rate limiting feedback
 * - Secure cookie settings
 */

'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Shield, Lock, Mail, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAdminLogin } from '@/lib/hooks/use-admin-login';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormData>();

  const { mutate: login, isPending, error } = useAdminLogin();

  const onSubmit = (data: AdminLoginFormData) => {
    login(data);
  };

  // Check if account is locked
  const isAccountLocked = error?.code === 'ACCOUNT_LOCKED';
  const hasFailedAttempts = error && !isAccountLocked;

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl border-2 border-red-100">
      {/* Admin Badge */}
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 shadow-lg">
          <Shield className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold text-white">ADMIN ACCESS</span>
        </div>
      </div>

      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Portal</h1>
        <p className="text-gray-600">Authorized personnel only</p>
      </div>

      {/* Security Warning */}
      <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">Security Notice</p>
            <p>
              This is a restricted area. All access attempts are logged and monitored.
              Unauthorized access is strictly prohibited.
            </p>
          </div>
        </div>
      </div>

      {/* Account Locked Warning */}
      {isAccountLocked && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-semibold mb-1">Account Locked</p>
              <p>{error.message}</p>
              <p className="mt-2 text-xs">
                If you believe this is an error, please contact the system administrator.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Attempts Warning */}
      {hasFailedAttempts && (
        <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Authentication Failed</p>
            <p>{error.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Admin Email
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
              } py-3 pl-10 pr-4 transition-all focus:border-red-500 focus:outline-none focus:ring-2 ${
                errors.email ? 'focus:ring-red-500/20' : 'focus:ring-red-500/20'
              }`}
              placeholder="admin@collabuu.com"
              disabled={isPending || isAccountLocked}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
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
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              })}
              className={`w-full rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-red-500 focus:outline-none focus:ring-2 ${
                errors.password ? 'focus:ring-red-500/20' : 'focus:ring-red-500/20'
              }`}
              placeholder="••••••••••••"
              disabled={isPending || isAccountLocked}
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Security Info */}
        <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5 text-gray-500" />
            <div>
              <p className="font-semibold mb-1">Enhanced Security Active</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Account locks after 5 failed attempts (30 min)</li>
                <li>All login attempts are logged with IP address</li>
                <li>Session expires after 24 hours of inactivity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending || isAccountLocked}
          className="w-full rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 font-semibold text-white transition-all hover:from-red-600 hover:to-red-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying credentials...
            </span>
          ) : isAccountLocked ? (
            'Account Locked'
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Secure Admin Login
            </span>
          )}
        </button>
      </form>

      {/* Footer Notice */}
      <div className="mt-8 text-center">
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-semibold">Protected System</p>
          <p>
            Login attempts are monitored and logged.
          </p>
          <p className="text-gray-400">
            Need help? Contact system administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
