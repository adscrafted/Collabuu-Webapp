import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-white to-blue-50 px-4 py-12">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-1/4 h-64 w-64 rounded-full bg-pink-200 opacity-20 blur-3xl" />
        <div className="absolute -right-4 bottom-1/4 h-64 w-64 rounded-full bg-blue-200 opacity-20 blur-3xl" />
        <div className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full bg-purple-200 opacity-10 blur-3xl" />
      </div>

      {/* Content container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Collabuu branding */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              Collabuu
            </h1>
          </div>
          <p className="text-sm text-gray-600">
            Connect businesses with influencers
          </p>
        </div>

        {/* Auth form */}
        {children}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Collabuu. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
