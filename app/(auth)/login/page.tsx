'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useLogin } from '@/lib/hooks/use-login';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const { mutate: login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome Back
        </h1>
        <p className="text-gray-600">Sign in to your Collabuu account</p>
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
              placeholder="you@example.com"
              disabled={isPending}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
              autoComplete="current-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              className={`w-full rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } py-3 pl-10 pr-4 transition-all focus:border-pink-500 focus:outline-none focus:ring-2 ${
                errors.password ? 'focus:ring-red-500/20' : 'focus:ring-pink-500/20'
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

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              disabled={isPending}
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-pink-500 hover:text-pink-600"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-pink-500 py-3 font-semibold text-white transition-all hover:bg-pink-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-pink-500 hover:text-pink-600"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
