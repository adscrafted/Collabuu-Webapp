'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isBrands = pathname === '/brands';
  const isCreators = pathname === '/creators';

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Collabuu
            </span>
          </span>
        </Link>

        {/* Desktop Tabbed Navigation */}
        <div className="hidden items-center gap-2 rounded-full bg-gray-100 p-1 md:flex">
          <Link
            href="/brands"
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              isBrands
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            For Brands
          </Link>
          <Link
            href="/creators"
            className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
              isCreators
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            For Creators
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
              Login
            </Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full bg-gray-900 px-6 text-white hover:bg-gray-800">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <div className="container mx-auto space-y-4 px-4 py-6">
            <Link
              href="/brands"
              className={`block text-sm font-medium ${
                isBrands
                  ? 'text-purple-600 font-semibold'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              For Brands
            </Link>
            <Link
              href="/creators"
              className={`block text-sm font-medium ${
                isCreators
                  ? 'text-pink-600 font-semibold'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              For Creators
            </Link>
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full bg-gray-900 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
