import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
} from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <span className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Collabuu
                </span>
              </span>
            </Link>
            <p className="mb-6 text-gray-600 max-w-sm">
              The ultimate platform connecting businesses with influencers for
              authentic collaborations that drive real results.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-white p-2 text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-600"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#for-brands"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  For Brands
                </Link>
              </li>
              <li>
                <Link
                  href="#for-creators"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  For Creators
                </Link>
              </li>
              <li>
                <Link
                  href="/case-studies"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-900">
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/help"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/documentation"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  API
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-gray-600 transition-colors hover:text-purple-600"
                >
                  Status
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@collabuu.com"
                  className="flex items-center gap-2 text-gray-600 transition-colors hover:text-purple-600"
                >
                  <Mail className="h-4 w-4" />
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Collabuu. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-600 transition-colors hover:text-purple-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-600 transition-colors hover:text-purple-600"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-600 transition-colors hover:text-purple-600"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
