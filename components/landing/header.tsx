'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Collabuu
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/brands"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-purple-600"
          >
            For Brands
          </Link>
          <Link
            href="/creators"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-purple-600"
          >
            For Creators
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-purple-600"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-purple-600"
          >
            Pricing
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-700">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
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
              className="block text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Brands
            </Link>
            <Link
              href="/creators"
              className="block text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              For Creators
            </Link>
            <Link
              href="#features"
              className="block text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-sm font-medium text-gray-700 hover:text-purple-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white">
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
