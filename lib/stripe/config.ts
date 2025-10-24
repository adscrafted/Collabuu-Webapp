/**
 * Stripe Configuration
 * Credit package definitions matching iOS In-App Purchase system
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe client-side (singleton pattern)
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!key) {
      console.error('Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable');
      throw new Error('Stripe publishable key is not configured');
    }

    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Credit package type definition
export interface CreditPackage {
  id: string;
  productId: string; // Matches iOS product ID
  credits: number;
  price: number; // Price in USD
  priceId?: string; // Stripe Price ID (set in Stripe Dashboard)
  displayPrice: string;
  perCreditPrice: number;
  discount?: number; // Discount percentage
  recommended?: boolean;
}

// Credit packages with savings calculated from $1 per credit baseline
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: '100credits',
    productId: '100credits',
    credits: 100,
    price: 100,
    displayPrice: '$100',
    perCreditPrice: 1.0,
    discount: 0, // Baseline pricing
    // priceId: 'price_xxx', // Set after creating in Stripe Dashboard
  },
  {
    id: '500credits',
    productId: '500credits',
    credits: 500,
    price: 450,
    displayPrice: '$450',
    perCreditPrice: 0.90,
    discount: 10, // Save 10% from $500 baseline
    // priceId: 'price_xxx', // Set after creating in Stripe Dashboard
  },
  {
    id: '1000credits',
    productId: '1000credits',
    credits: 1000,
    price: 850,
    displayPrice: '$850',
    perCreditPrice: 0.85,
    discount: 15, // Save 15% from $1000 baseline
    recommended: true,
    // priceId: 'price_xxx', // Set after creating in Stripe Dashboard
  },
  {
    id: '2500credits',
    productId: '2500credits',
    credits: 2500,
    price: 2000,
    displayPrice: '$2,000',
    perCreditPrice: 0.80,
    discount: 20, // Save 20% from $2500 baseline
    // priceId: 'price_xxx', // Set after creating in Stripe Dashboard
  },
  {
    id: '5000credits',
    productId: '5000credits',
    credits: 5000,
    price: 3750,
    displayPrice: '$3,750',
    perCreditPrice: 0.75,
    discount: 25, // Save 25% from $5000 baseline
    // priceId: 'price_xxx', // Set after creating in Stripe Dashboard
  },
];

// Helper function to get package by ID
export const getCreditPackageById = (packageId: string): CreditPackage | undefined => {
  return CREDIT_PACKAGES.find((pkg) => pkg.id === packageId);
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Helper function to format per-credit price
export const formatPerCreditPrice = (perCreditPrice: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(perCreditPrice);
};
