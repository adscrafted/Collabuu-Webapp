'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  User,
  Users,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuItems = [
    {
      label: 'Profile',
      icon: User,
      href: '/profile',
    },
    {
      label: 'Team Members',
      icon: Users,
      href: '/team',
    },
    {
      label: 'Logout',
      icon: LogOut,
      href: '/login',
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 shadow-sm sm:px-6 lg:px-8">
      {/* Left Section - Menu */}
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Right Section - User Menu */}
      <div className="flex items-center gap-2 sm:gap-4">

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 rounded-lg p-1.5 pr-4 transition-colors hover:bg-gray-100"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt="User" />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden min-w-[110px] text-left sm:block">
              <p className="text-sm font-semibold text-text-primary">
                {user?.name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-text-secondary">
                {user?.role || 'Business'}
              </p>
            </div>
            <ChevronDown
              className={cn(
                'hidden h-4 w-4 text-gray-400 transition-transform sm:block',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsUserMenuOpen(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
                {/* User Info - Mobile */}
                <div className="border-b border-border p-3 sm:hidden">
                  <p className="font-semibold text-text-primary">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-sm text-text-secondary">{user?.email || ''}</p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={() => {
                          router.push(item.href);
                          setIsUserMenuOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50',
                          item.className || 'text-gray-700'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
