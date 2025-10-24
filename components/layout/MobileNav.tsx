'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  {
    name: 'Campaigns',
    href: '/campaigns',
    icon: Target,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background shadow-lg lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex min-w-[64px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all',
                isActive
                  ? 'text-pink-600'
                  : 'text-gray-600 active:bg-gray-100'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6 transition-colors',
                  isActive && 'text-pink-600'
                )}
              />
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-pink-600' : 'text-gray-600'
                )}
              >
                {item.name}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-t-full bg-pink-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
