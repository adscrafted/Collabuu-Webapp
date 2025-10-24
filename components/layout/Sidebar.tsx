'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Target,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCreditBalance } from '@/lib/hooks/use-credit-balance';
import { useAuth } from '@/lib/hooks/use-auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const navigationItems = [
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Target,
    description: 'Manage campaigns',
  },
];

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
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
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-background shadow-lg transition-all duration-300 lg:static lg:h-full lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo & Toggle Button */}
        <div className={cn(
          "flex h-16 items-center border-b border-border transition-all",
          isCollapsed ? "justify-center px-4" : "justify-between px-6"
        )}>
          <Link href="/campaigns" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-pink-600 shrink-0">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold text-pink-500 whitespace-nowrap">Collabuu</span>
            )}
          </Link>

          {/* Close button - Mobile only */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Toggle collapse button - Desktop only */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          "flex-1 space-y-1 overflow-y-auto",
          isCollapsed ? "p-2" : "p-4"
        )}>
          <TooltipProvider delayDuration={0}>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              const navItem = (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-fast',
                    isCollapsed ? 'justify-center px-3 py-2.5' : 'gap-3 px-3 py-2.5',
                    isActive
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors shrink-0',
                      isActive ? 'text-pink-600' : 'text-gray-500 group-hover:text-gray-700'
                    )}
                  />
                  {!isCollapsed && (
                    <span className="flex-1">{item.name}</span>
                  )}

                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-pink-500" />
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      {navItem}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return navItem;
            })}
          </TooltipProvider>
        </nav>

        {/* Credits Balance */}
        <div className={cn(
          "border-t border-border",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {isCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push('/profile?tab=billing')}
                    className="w-full rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 p-3 hover:from-pink-100 hover:to-pink-200 transition-all"
                  >
                    <CreditCard className="h-6 w-6 text-pink-500 mx-auto" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium bg-gray-900 text-white border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-300">Credits</p>
                    <p className="text-lg font-bold text-white">
                      {creditBalance?.credits?.toLocaleString() || '0'}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
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
          )}
        </div>

      </aside>
    </>
  );
}
