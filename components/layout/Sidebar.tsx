'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Target,
  CreditCard,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { useAuth } from '@/lib/hooks/use-auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Target,
    description: 'Manage campaigns',
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Get user data from auth context
  const { token } = useAuth();

  // Fetch credit balance
  const { data: creditBalance } = useCreditBalance(token);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background shadow-lg transition-transform duration-300 lg:static lg:h-full lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <Link href="/campaigns" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-pink-600">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold text-pink-500">Collabuu</span>
          </Link>

          {/* Close button - Mobile only */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-fast',
                  isActive
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-700'
                  )}
                />
                <span className="flex-1">{item.name}</span>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-pink-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Credits Balance */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Credits</p>
                <p className="text-2xl font-bold text-pink-600">
                  {creditBalance?.credits?.toLocaleString() || '0'}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-pink-500 opacity-50" />
            </div>
            <Button
              variant="default"
              size="sm"
              className="mt-3 w-full bg-pink-500 hover:bg-pink-600"
              onClick={() => router.push('/profile?tab=billing')}
            >
              Buy Credits
            </Button>
          </div>
        </div>

      </aside>
    </>
  );
}
